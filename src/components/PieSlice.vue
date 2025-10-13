<script setup lang='ts'>
import { ref, computed, watch } from 'vue'
import { useOuterSlicePath } from '@/composables/usePieArc'
import useTransition from '@/composables/useTransition'
import { clamp } from '@/utils'

const {
  value = 0,
  color,
  pattern,
  gap = 0,
  innerCut = 0,
  rounded = 0,
  rotate = 0,
  hoverScale = 0.05,
  reveal = false,
  duration = 400,
  animation = (t: number) => (t ** 3)
} = defineProps<{
  value?: number
  color: string
  pattern?: string
  gap?: number
  innerCut?: number
  rounded?: number
  rotate?: number
  hoverScale?: number
  reveal?: boolean
  animation?: (t: number) => number
  duration?: number
}>()

const active = defineModel('active', { type: Boolean, required: false, default: false })
const state = ref(reveal ? 'initial' : 'disabled')
const transition = { duration, transition: animation }
const hoverZoomRatio = clamp(hoverScale, 0, 0.25)

// Computed dimensions
const arcSize = computed(() => state.value === 'initial' ? 0 : clamp(value - 100 * gap / 360, 0.1, 99.99))
const currArcSize = useTransition(arcSize, transition)

const angle = computed(() => state.value === 'initial' ? 360 : (rotate + gap / 2))
const currAngle = useTransition(angle, transition)

const arcRadius = computed(() => 50 * (active.value ? 1 : (1 - hoverZoomRatio)))
const currArcRadius = useTransition(arcRadius, transition)

const arcWidth = computed(() => 50 * (1 - clamp(innerCut / 100, 0, 1)) * (active.value ? 1 : (1 - hoverZoomRatio)))
const currArcWidth = useTransition(arcWidth, transition)

const outerSlicePath = useOuterSlicePath({
  size: currArcSize,
  angle: currAngle,
  radius: currArcRadius,
  width: currArcWidth,
  rounded
})

// Full-size slice without gaps for tooltips
const radians = computed(() => (360 * (-value / 100) + 90) * (Math.PI / 180))
const overlayPath = computed(() => `M 50 0 A 50 50 0 ${value > 50 ? 1 : 0} 1 ${50 + 50 * Math.cos(radians.value)} ${50 - 50 * Math.sin(radians.value)} L 50 50`)

// Animation on value change
watch(() => value, async () => {
  active.value = false
  if (reveal) {
    state.value = 'initial'
    await new Promise(resolve => requestAnimationFrame(resolve))
    state.value = 'pending'
    await new Promise(resolve => setTimeout(resolve, duration))
    state.value = 'done'
  }
}, { immediate: true })
</script>

<template>
<g
  class='pie-segment'
  :style='{ color: color }'
>
  <path
    key='pie-slice'
    fill='currentColor'
    shape-rendering='geometricPrecision'
    :d='outerSlicePath'
  />
  <path
    v-if='pattern'
    key='pie-pattern'
    shape-rendering='geometricPrecision'
    :fill='`url(#${pattern})`'
    :d='outerSlicePath'
  />
  <path
    v-if='["disabled", "done"].includes(state)'
    key='pie-overlay'
    :transform='`rotate(${currAngle} 50 50)`'
    fill='none'
    :d='overlayPath'
    @mouseenter.passive='active = true'
    @mouseleave.passive='active = false'
  />
</g>
</template>
