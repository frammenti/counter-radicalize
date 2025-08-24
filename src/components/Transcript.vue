<script setup lang='ts'>
import { shallowRef, computed, watch } from 'vue'
import type { Segment } from '../types/segment'

const playtime = defineModel<number>('playtime', { type: Number, required: true });
const props = defineProps<{ segments: Segment[] }>()
const spans = shallowRef<HTMLSpanElement[]>([])

// Sync index of active segment
function atMoment(seg: Segment, t: number): boolean {
  let start = seg.start > 0 ? seg.start - 0.01 : 0
  return start < t && t < seg.end
}
const active = computed(() =>
  props.segments.findIndex(seg => atMoment(seg, playtime.value))
)

// Scroll active segment into view
watch(active, i => {
  let el = spans.value[i]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})
</script>

<template>
  <div class='transcript-body'>
    <span
      v-for='(seg, i) in segments'
      :key='i'
      :ref='el => { if (el) spans[i] = el as HTMLSpanElement }'
      :class='{ active: i === active }'
      tabindex='0'
      role='button'
      @click='() => playtime = seg.start'
      @keydown.enter='() => playtime = seg.start'
    >
      {{ seg.text }}
    </span>
  </div>
</template>

<style scoped>
.transcript-body {
  line-height: 1.6;
  max-width: 50em;
  text-align: justify;
}
.transcript-body span {
  transition: all 0.2s ease-in-out;
  padding: 0.25rem 0;
}
.transcript-body span:hover {
  text-shadow: var(--shadow-color) 0 0 15px;
  cursor: pointer;
}
.active {
  color: var(--primary-color);
}
</style>
