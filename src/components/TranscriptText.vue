<script setup lang='ts'>
import { shallowRef, watch } from 'vue'
import type { Segment } from '@/types/segment'

const playtime = defineModel('playtime', { type: Number, required: true })
const props = defineProps<{ segments: Segment[], active: number }>()
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
      >
        {{ seg.text }}
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
@media (any-hover: hover) {
  span:hover {
    background-color: resp($shadow-color);
  }
}
</style>
