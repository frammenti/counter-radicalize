<script setup lang='ts'>
import { ref, useTemplateRef, watch, nextTick } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { playtime, playing, rapid } from '@/stores/state'
import parsePlaceholders from '@/composables/parsePlaceholders'
import type { AlignedSegment } from '@/types/segment'

const props = defineProps<{ segments: AlignedSegment[], locked: boolean }>()
const active = defineModel('active', { type: Number, required: true })

const container = useTemplateRef('container')
const spans = ref<HTMLSpanElement[]>([])
const scrolling = ref<boolean>(false)
let lastInteraction: number = Date.now()

watch(active, i => {
  const el = spans.value[i]
  if (!el || !container.value) return
  if (Date.now() - lastInteraction < 3000 && !props.locked) return

  const offset =
    el.offsetTop - container.value.clientHeight / 2 + el.getBoundingClientRect().height / 2

  doScroll(offset)
})

const doScroll = useThrottleFn((offset: number) => {
  const parent = container.value!
  const maxScrollTop = parent.scrollHeight - parent.clientHeight - 2
  const atTop = parent.scrollTop <= 0 && offset <= 0
  const atBottom = parent.scrollTop >= maxScrollTop && offset >= maxScrollTop

  if (props.locked && (atTop || atBottom)) return

  if (props.locked) {
    scrolling.value = true
    parent.addEventListener(
      'scrollend',
      () => nextTick(() => (scrolling.value = false)),
      { once: true }
    )
  }
  requestAnimationFrame (() =>  parent.scroll({ top: offset, behavior: 'smooth' }))
}, 300)

function recordInteraction() {
  if (!props.locked) lastInteraction = Date.now()
}

function updatePlaytime(segment: AlignedSegment, index: number) {
  active.value = index
  playtime.value = segment.start
}

function play(e: Event) {
  e.preventDefault()
  playing.value = !playing.value
}

const focus = useThrottleFn((index: number, direction?: 'next' | 'prev', event?: KeyboardEvent) => {
  if (event) rapid.value = event.repeat
  let target: HTMLSpanElement
  let targetIndex: number
  if (direction === 'prev') {
    targetIndex = index - 1
    target = spans.value[targetIndex]
    if (!target) {
      targetIndex = spans.value.length - 1
      target = spans.value[targetIndex]
    }
  } else if (direction === 'next') {
    targetIndex = index + 1
    target = spans.value[targetIndex]
    if (!target) {
      targetIndex = 0
      target = spans.value[targetIndex]
    }
  } else {
    console.log(index)
    targetIndex = index
    target = spans.value[targetIndex]
  }
  updatePlaytime(props.segments[targetIndex], targetIndex)
  target.focus({ preventScroll: true })
}, 150)

</script>

<template>
<div
  id='transcript-container'
  ref='container'
  @wheel='recordInteraction'
  @touchmove='recordInteraction'
  @keydown.self.enter='active > 0 ? focus(active) : focus(0)'
  :class='{ locked: locked }'
  :style='{ overflowY: locked ? (scrolling ? "auto" : "hidden") : "auto" }'
  :aria-activedescendant='active > 0 ? `seg-${active}` : undefined'
>
  <p id='transcript-body'>
    <span
      v-for='(seg, i) in segments'
      :key='i'
      :id='"seg-" + i'
      :ref='(el) => {
        if (el) spans[i] = el as HTMLSpanElement
      }'
      :class='{ active: i === active }'
      class='segment'
      @click='updatePlaytime(seg, i)'
      @keydown.space='play'
      @keydown.right='focus(i, "next", $event)'
      @keydown.left='focus(i, "prev", $event)'
      aria-role='button'
      aria-controls='audio-player'
      :aria-current='i == active'
      :tabindex='i == active ? 0 : -1'
    >
      <template v-for='(token, j) in parsePlaceholders(seg.disfluencyText)' :key='j'>
        <template v-if='typeof token === "string"'>
          {{ token }}
        </template>
          <span
            v-else
            class='disfluency'
            :class='token.class'
          >
            {{ token.content.join('') }}
          </span>
      </template>
    </span>
  </p>
</div>
</template>

<style scoped lang='scss'>
#transcript-container {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  position: relative;
  scrollbar-gutter: stable;
  will-change: scroll-position;
  &.locked {
    scrollbar-color: transparent transparent;
    overflow-y: hidden;
  }
}
#transcript-body {
  font-size: $fs-m;
  line-height: 1.7;
  text-align: left;
  padding-inline: 0.5rem;
  margin-block: 0;
  hyphens: auto;
}
.segment {
  padding-block: 0.1rem;
  padding-inline: 0.2rem;
  margin-block: -0.1rem;
  margin-inline: -0.2rem;
  border-radius: $large-radius;
  box-decoration-break: clone;
  transition: background-color 150ms ease;
  cursor: pointer;
  &:focus-visible {
    @include theme(background-color, shadow);
  }
}
.active {
  @include theme(color, link);
}
@media (hover: hover) {
  .segment:hover {
    @include theme(background-color, shadow);
  }
}
</style>
