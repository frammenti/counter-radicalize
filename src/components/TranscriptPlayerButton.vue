<script setup lang='ts'>
import { ref, onUnmounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { animate, createBackIn } from 'popmotion'
import type { PlaybackOptions, SpringOptions, KeyframeOptions } from 'popmotion'
import { playing } from '@/stores/state'

const { anchor } = defineProps<{ anchor: HTMLElement | null }>()


const show = ref(false)
const translate = ref(80)
const animating = ref(false)
let animation: ReturnType<typeof animate<number>>

const enter: PlaybackOptions<number> & SpringOptions = {
  from: 80,
  to: 0,
  type: 'spring',
  stiffness: 200,
  damping: 14,
  mass: 2,
  velocity: 0,
  onPlay: () => { animating.value = true; show.value = true },
  onUpdate: (v: number) => translate.value = v,
  onComplete: () => animating.value = false
}

const exit: PlaybackOptions<number> & KeyframeOptions = {
  to: [0, 80],
  type: 'keyframes',
  duration: 300,
  ease: createBackIn(4),
  onPlay: () => animating.value = true,
  onUpdate: (v: number) => translate.value = v,
  onComplete: () => { animating.value = false; show.value = false }
}

const { stop } = useIntersectionObserver(
  anchor,
  ([entry]) => {
    const isPast = !entry.isIntersecting && entry.boundingClientRect.top < 0
    animation?.stop()
    animation = isPast ? animate(enter) : animate(exit)
  },
  { threshold: 1, rootMargin: '20% 0% 0% 0%' }
)

onUnmounted(stop)
</script>

<template>
<button
  class='button button-primary'
  :style='{
    display: show ? "flex" : "none",
    transform: animating ? `translateY(${translate}px)` : undefined
  }'
  aria-label='Play'
  :aria-pressed='playing'
  aria-controls='audio-player'
  @click.passive='playing = !playing'
>
<svg viewBox='0 0 24 24' fill='currentColor' role='presentation'>
    <path v-if='playing' id='pause-icon' d='M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7z' />
    <path v-else id='play-icon' d='m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606' />
</svg>
</button>
</template>

<style scoped lang='scss'>
.button {
  border-radius: $radius-max;
  padding: 0;
  align-items: center;
  justify-content: center;
  transform: scale(1);
  transition:
    background-color 50ms ease,
    transform 50ms ease-in-out;
  will-change: transform, background-color;

  &:hover {
    transform: scale(1.04);
  }

  &[aria-pressed='true'] {
    transform: scale(1);
  }

  svg {
    height: 24px;
    width: 24px;
  }
}
</style>