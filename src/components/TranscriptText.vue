<script setup lang='ts'>
import { shallowRef, watch, defineAsyncComponent, onMounted } from 'vue'
import { playtime } from '@/stores/playtime'
import parsePlaceholders from '@/composables/parsePlaceholders'
import type { EmotionSegment } from '@/types/emotion-segment'

const Tooltip = defineAsyncComponent(() => import('@/components/Tooltip.vue'))

const props = defineProps<{ segments: EmotionSegment[], active: number, annotated: boolean }>()
const spans = shallowRef<HTMLSpanElement[]>([])
const container = shallowRef<HTMLDivElement>()
const hoverable = window.matchMedia('(hover: hover)').matches
let left: number = 0
let right: number = 0

onMounted(() => {
  const dims = container.value!.getBoundingClientRect()
  left = dims.left
  right = dims.right
})

// Scroll to center the active item into the container
watch(() => props.active, i => {
  const el = spans.value[i]
  const parent = container.value
  if (el && parent) {
    const offset =
      el.offsetTop - parent.clientHeight / 2 + el.getBoundingClientRect().height / 2
    parent.scrollTo({ top: offset, behavior: 'smooth' })
  }
})
</script>

<template>
<div id='transcript-container' ref='container' :aria-activedescendant='"seg-" + active'>
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
      @click='() => (playtime = seg.start)'
      @keydown.enter='() => (playtime = seg.start)'
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
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  position: relative;
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
  border-radius: 0.5rem;
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
