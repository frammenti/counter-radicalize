<script setup lang='ts'>
import { ref, computed, useTemplateRef, watch, nextTick } from 'vue'
import { useThrottleFn, useElementVisibility } from '@vueuse/core'
import { playtime, playing, rapid } from '@/stores/state'
import parsePlaceholders from '@/composables/parsePlaceholders'
import type { AlignedSegment } from '@/types/segment'

const { segments, locked } = defineProps<{ segments: AlignedSegment[], locked: boolean }>()
const active = defineModel('active', { type: Number, required: true })

const container = useTemplateRef('container')
const spans = ref<HTMLSpanElement[]>([])
const scrolling = ref<boolean>(false)
const visible = useElementVisibility(container)
let lastInteraction: number = Date.now()

watch([active, visible], ([i, inView], [_, prevView]) => {
  const el = spans.value[i]
  if (!el || !container.value || !inView) return
  if (Date.now() - lastInteraction < 3000 && !locked) return

  const offset =
    el.offsetTop - container.value.clientHeight / 2 + el.getBoundingClientRect().height / 2

  doScroll(offset, !prevView)
})

const doScroll = useThrottleFn((offset: number, instant: boolean) => {
  const parent = container.value!
  const maxScrollTop = parent.scrollHeight - parent.clientHeight - 2
  const atTop = parent.scrollTop <= 0 && offset <= 0
  const atBottom = parent.scrollTop >= maxScrollTop && offset >= maxScrollTop

  if (locked && (atTop || atBottom)) return

  if (locked && !instant) {
    scrolling.value = true
    parent.addEventListener(
      'scrollend',
      () => nextTick(() => (scrolling.value = false)),
      { once: true }
    )
  }
  requestAnimationFrame (() =>  parent.scrollTo({ top: offset, behavior: instant ? 'instant' : 'smooth' }))
}, 300)

function recordInteraction() {
  if (!locked) lastInteraction = Date.now()
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
  updatePlaytime(segments[targetIndex], targetIndex)
  target.focus({ preventScroll: true })
}, 150)

// Paragraphs
interface IndexedSegment extends AlignedSegment {
  index: number
}
const paragraphs = computed(() => {
  const groups: IndexedSegment[][] = []
  let current: IndexedSegment[] = []

  segments.forEach((seg, index) => {
    const segI = { ...seg, index }
    current.push(segI)
    if (segI.disfluencyText.endsWith('\n')) {
      groups.push(current)
      current = []
    }
  })
  if (current.length > 0) groups.push(current)
  return groups
})
</script>

<template>
<div
  id='transcript-container'
  ref='container'
  tabindex='0'
  @wheel='recordInteraction'
  @touchmove='recordInteraction'
  @keydown.self.enter='active > 0 ? focus(active) : focus(0)'
  :class='{ locked: locked }'
  :style='{ overflowY: locked ? (scrolling ? "auto" : "hidden") : "auto" }'
  :aria-activedescendant='active > 0 ? `seg-${active}` : undefined'
>
  <div id='transcript-body'>
    <p v-for='(group, g) in paragraphs' :key='g'>
      <span
        v-for='seg in group'
        :key='seg.index'
        :id='"seg-" + seg.index'
        :ref='(el) => {
          if (el) spans[seg.index] = el as HTMLSpanElement
        }'
        :class='{ active: seg.index === active }'
        class='segment'
        @click='updatePlaytime(seg, seg.index)'
        @keydown.space='play'
        @keydown.right='focus(seg.index, "next", $event)'
        @keydown.left='focus(seg.index, "prev", $event)'
        role='button'
        aria-controls='audio-player'
        :aria-current='seg.index == active'
        :tabindex='seg.index == active ? 0 : -1'
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
</div>
</template>

<style scoped lang='scss'>
#transcript-container {
  overflow-y: auto;
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
  padding-inline: 0.5rem;
  margin-block: 0;
  hyphens: auto;
}
.segment {
  padding-block: 0.108lh;
  padding-inline: 0.2rem;
  margin-block: -0.108lh;
  margin-inline: -0.2rem;
  border-radius: $radius-l;
  box-decoration-break: clone;
  transition: background-color 150ms ease;
  cursor: pointer;
  &:focus-visible {
    outline-offset: -1px;
    @include theme(background-color, shadow);
  }
}
.active {
  @include theme(color, primary-text);
}
@media (hover: hover) {
  #transcript-container {
    overscroll-behavior: auto;
  }
  .segment:hover {
    @include theme(background-color, shadow);
  }
}

// Disfluencies
[annotated="true"] {
  .sound.repetition,
  .interjection {
    text-decoration-line: underline;
    text-decoration-thickness: 1px;
    @include theme(text-decoration-color, secondary-text);
  }
  .sound.repetition {
    text-decoration-style: double;
  }
  .interjection {
    text-decoration-style: wavy;
  }
  .block:before,
  .word.repetition:after,
  .prolongation:after {
    display: inline-flex;
    text-wrap: nowrap;
    @include theme(color, secondary-text);
  }
  .block:before,
  .word.repetition:after {
    font-variation-settings: 'wght' 600;
  }
  .block:before {
    content: '\a0‖\a0';
  }
  .word.repetition:after {
    content: '\202fx2';
    font-variant: small-caps;
    font-size: 50%;
    vertical-align: top;
  }
  .word.repetition:has(+ .word.repetition):after,
  .word.repetition:has(+ div + .word.repetition):after
  {
    content: '';
  }
  .block:before,
  .prolongation:after {
    vertical-align: auto;
  }
  .prolongation:after {
    content: '\2060:::';
    font-variation-settings: 'wght' 400;
  }
  .active {
    .sound.repetition,
    .interjection {
      @include theme-mix(text-decoration-color, primary-text, secondary-text, 30%, 85%);
    }
    .block:before,
    .prolongation:after,
    .word.repetition:after {
      @include theme-mix(color, primary-text, secondary-text, 30%, 85%);
    }
  }
}
</style>
