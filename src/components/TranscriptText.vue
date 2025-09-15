<script setup lang='ts'>
import { shallowRef, watch } from 'vue'
import patterns from '@/stores/disfluency_patterns.json'
import useDisfluencyPattern from '@/composables/useDisfluencyPattern'
import type { EmotionSegment } from '@/types/emotion-segment'

const playtime = defineModel('playtime', { type: Number, required: true })
const props = defineProps<{ segments: EmotionSegment[], active: number }>()
const spans = shallowRef<HTMLSpanElement[]>([])
const container = shallowRef<HTMLDivElement | null>(null)

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
        @click='() => (playtime = seg.start)'
        @keydown.enter='() => (playtime = seg.start)'
        aria-controls='audio-player'
        :aria-current='i === active ? true : false'
        v-html="useDisfluencyPattern(seg.text, patterns[i]) + ' '"
      >
      </span>
    </p>
  </div>
</template>

<style scoped lang='scss'>
#transcript-container {
  height: 100%;
  overflow-y: scroll;
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

:deep(.sound-repetition) {
  text-emphasis: dot resp($annotation-color);
}

:deep(.block):before {
  content: " ‖ ";
  font-weight: 600;
  color: resp($annotation-color);
  font-style: normal;
  text-emphasis: none;
}

:deep(.word-repetition):after {
  content: " x2";
  font-weight: 600;
  font-variant: small-caps;
  font-size: 50%;
  vertical-align: top;
  color: resp($annotation-color);
  text-emphasis: none;
}

:deep(.interjection) {
  font-style: italic;
  color: resp($annotation-color);
}

:deep(.prolongation):after {
  content: ":::";
  font-weight: 400;
  font-style: normal;
  color: resp($annotation-color);
  text-emphasis: none;
}

.active :deep(.disfluency),
.active :deep(.disfluency):before,
.active :deep(.disfluency):after {
  color: resp($link-color);
  text-emphasis-color: resp($link-color);
}


@media (any-hover: hover) {
  span:hover {
    background-color: resp($shadow-color);
  }
}
</style>
