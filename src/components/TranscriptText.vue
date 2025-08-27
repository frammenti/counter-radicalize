<script setup lang='ts'>
import { shallowRef, watch } from 'vue'
import type { Segment } from '../types/segment'

const playtime = defineModel('playtime', { type: Number, required: true })
const props = defineProps<{ segments: Segment[]; active: number }>()
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
  <div id='transcript-container' ref='container' aria-live='polite'>
    <div id='transcript-body'>
      <span
        v-for='(seg, i) in segments'
        :key='i'
        :ref='(el) => {
          if (el) spans[i] = el as HTMLSpanElement
        }'
        tabindex='0'
        role='button'
        :class='{ active: i === active }'
        @click='() => (playtime = seg.start)'
        @keydown.enter='() => (playtime = seg.start)'
      >
        {{ seg.text }}
      </span>
    </div>
  </div>
</template>

<style scoped lang='scss'>
@use '../assets/styles/palette' as *;

#transcript-container {
  height: 100%;
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-gutter: stable both-edges;
  position: relative;
}
#transcript-body {
  line-height: 1.6;
  max-width: 55em;
  text-align: justify;
  padding: 0 0.5rem;
}
span {
  padding: 0.3rem 0.2rem;
  margin: -0.3rem -0.2rem;
  border-radius: 0.5rem;
  transition: background-color 150ms ease;
  cursor: pointer;
}
span:hover {
  background-color: resp($shadow-color);
}
.active {
  color: resp($link-color);
}
</style>
