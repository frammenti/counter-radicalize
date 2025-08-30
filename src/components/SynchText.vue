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
  <div id='transcript-container' ref='container' aria-live='polite'>
    <div id='transcript-body'>
      <span
        v-for='(seg, i) in segments'
        :key='i'
        :ref='(el) => {
          if (el) spans[i] = el as HTMLSpanElement
        }'
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
  position: relative;
}
#transcript-body {
  line-height: 1.6;
  text-align: justify;
  padding: 0 0.5rem;
}
span {
  padding-block: 0.2rem;
  padding-inline: 0.2rem;
  margin-block: -0.2rem;
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
