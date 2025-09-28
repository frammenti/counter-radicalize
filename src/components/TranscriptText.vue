<script setup lang='ts'>
import { ref, useTemplateRef, watch, defineAsyncComponent, onMounted, nextTick } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { playtime } from '@/stores/state'
import parsePlaceholders from '@/composables/parsePlaceholders'
import type { EmotionSegment } from '@/types/segment'

const Tooltip = defineAsyncComponent(() => import('@/components/Tooltip.vue'))

const props = defineProps<{ segments: EmotionSegment[], annotated: boolean, locked: boolean }>()
const active = defineModel('active', { type: Number, required: true })

const container = useTemplateRef('container')
const spans = ref<HTMLSpanElement[]>([])
const scrolling = ref<boolean>(false)
const hoverable = window.matchMedia('(hover: hover)').matches
let lastInteraction: number = Date.now()
let left: number = 0
let right: number = 0

onMounted(() => {
  if (!hoverable) return
  const dims = container.value!.getBoundingClientRect()
  left = dims.left
  right = dims.right
})

watch(active, i => {
  const el = spans.value[i]
  if (!el || !container.value) return
  if (Date.now() - lastInteraction < 3000 && !props.locked) return

  const offset =
    el.offsetTop - container.value.clientHeight / 2 + el.getBoundingClientRect().height / 2

  doThrottledScroll(offset)
})

const doThrottledScroll = useThrottleFn((offset: number) => doScroll(offset), 300)

function doScroll(offset: number) {
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
}

function recordInteraction() {
  if (!props.locked) lastInteraction = Date.now()
}

function updatePlaytime(segment: EmotionSegment, index: number) {
  active.value = index
  playtime.value = segment.start
}
</script>

<template>
<div
  id='transcript-container'
  ref='container'
  @wheel='recordInteraction'
  @touchmove='recordInteraction'
  :class='{ locked: locked }'
  :style='{ overflowY: locked ? (scrolling ? "auto" : "hidden") : "auto" }'
  :aria-activedescendant='active > 0 ? `seg-${active}` : undefined'
>
  <p id='transcript-body' :annotated>
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
      @keydown.enter='updatePlaytime(seg, i)'
      aria-controls='audio-player'
      :aria-current='i == active'
    >
      <template v-for='(token, j) in parsePlaceholders(seg.text)' :key='j'>
        <template v-if='typeof token === "string"'>
          {{ token }}
        </template>
        <Tooltip v-else :parent='container' :disabled='!annotated' :parent-size='hoverable ? [left, right] : undefined'>
          <span
            class='disfluency'
            :class='token.class'
          >
            {{ token.content.join("") }}
          </span>
          <template #content>
            <p v-for='d in token.desc'>{{ d }}</p>
          </template>
        </Tooltip>
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
}
#transcript-container.locked {
  scrollbar-color: transparent transparent;
  overflow-y: hidden;
}
#transcript-body {
  line-height: 1.6;
  text-align: justify;
  padding-inline: 0.5rem;
  margin-block: 0;
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
}
.active {
  color: resp($link-color);
}
@media (hover: hover) {
  #transcript-body > span:hover {
    background-color: resp($shadow-color);
  }
}
/* Disfluency annotated */
[annotated="true"] :deep(.sound-repetition) {
  text-decoration: underline dashed 1px resp($annotation-color);
}
[annotated="true"] :deep(.block):before {
  content: " ‖ ";
  font-weight: 600;
  color: resp($annotation-color);
  font-style: normal;
  text-decoration: none;
}
[annotated="true"] :deep(.word-repetition):after {
  content: " x2";
  font-weight: 600;
  font-variant: small-caps;
  font-size: 50%;
  vertical-align: top;
  color: resp($annotation-color);
  text-decoration: none;
}
[annotated="true"] :deep(.word-repetition):has(+ .word-repetition):after,
[annotated="true"] :deep(.word-repetition):has(+ div + .word-repetition):after
 {
  content: ""
}
[annotated="true"] :deep(.interjection) {
  font-style: italic;
  color: resp($annotation-color);
}
[annotated="true"] :deep(.prolongation):after {
  content: ":::";
  font-weight: 400;
  font-style: normal;
  color: resp($annotation-color);
  text-decoration: none;
}
[annotated="true"] .active :deep(.sound-repetition) {
  text-decoration-color: resp-mix($link-color, $annotation-color);
}
[annotated="true"] .active :deep(.interjection),
[annotated="true"] .active :deep(.block):before,
[annotated="true"] .active :deep(.prolongation):after,
[annotated="true"] .active :deep(.word-repetition):after {
  color: resp-mix($link-color, $annotation-color);
}
</style>
