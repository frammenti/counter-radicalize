<script setup lang='ts'>
import { watch, useTemplateRef, onMounted } from 'vue'
import { playtime } from '@/stores/state'
import { capitalize } from '@/utils'
import type { RankedSegment } from '@/types/segment'

const { seg, state } = defineProps<{ seg: RankedSegment, state: 'start' | 'end' | 'resume' | 'cancel' }>()
const button = useTemplateRef('button')

function toggleActive(v: boolean = true, duration?: number, scale?: number) {
  const btn = button.value
  if (!btn) return
  if (v === false) {
    btn.style.setProperty('--duration', `${duration ?? 0}s`)
    btn.style.setProperty('--scale', '0')
  } else {
    btn.style.setProperty('--duration', `${duration ?? seg.end - seg.start}s`)
    btn.style.setProperty('--scale', `${scale ?? 1}`)
  }
}

function syncState(s: 'start' | 'end' | 'resume' | 'cancel') {
  switch (s) {
    case 'start':
      toggleActive(false)
      void button.value!.offsetWidth
      toggleActive()
      break
    case 'end':
      toggleActive(false, 0.3)
      break
    case 'cancel':
      toggleActive(false)
      break
    case 'resume':
      const scale = Number(button.value!.style.getPropertyValue('--scale')) || 0
      if (scale > 0) return
      const elapsed = (playtime.value - seg.start) / (seg.end - seg.start)
      toggleActive(true, 0, elapsed)
      void button.value!.offsetWidth
      const remaining = Math.max(seg.end - playtime.value, 0)
      toggleActive(true, remaining)
  }
}

onMounted(() => syncState(state))
watch(() => state, syncState)
</script>

<template>
<button class='button'
  ref='button'
>
  {{ capitalize(seg.text) }}
</button>
</template>

<style scoped lang='scss'>
$shift: 0.7rem;

.button {
  width: calc(100% - $shift);
  padding-block: $space-xs;
  padding-inline: $space-s-m;
  margin-block-start: -1rem;
  margin-inline-start: $shift;
  font-size: $fs-s;
  text-align: left;
  font-variation-settings: 'wght' 400;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  @include theme(background-color, background);
  @include theme(color, text);
  &:after {
    content: '';
    position: absolute;
    inset: 0;
    mix-blend-mode: difference;
    pointer-events: none;
    transform: scaleX(var(--scale, 0));
    will-change: transform;
    transform-origin: left;
    transition: transform var(--duration, 0s) linear;
    @include theme(background-color, link);
  }
  @media screen and (width >= $tablet) {
    font-size: $fs-base;
  }
}
</style>