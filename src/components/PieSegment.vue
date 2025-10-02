<script setup lang='ts'>
import { ref, toRef, onMounted } from 'vue'
import { useInnerSlicePath, useOuterSlicePath, usePieArc } from '@/composables/usePieArc'
import useTransition from '@/composables/useTransition'

const {
  value = 0,
  color,
  pattern,
  gap = 0,
  innerCut,
  rounded = 0,
  rotate = 0,
  hoverScale = 0.05,
  hide = false,
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
  hide?: boolean
  reveal?: boolean
  animation?: (t: number) => number
  duration?: number
}>()

const active = defineModel('active', { type: Boolean, required: false, default: false })
const state = ref(reveal ? 'initial' : 'disabled')
const transition = { duration, transition: animation }

const {
  hoverZoomRatio,
  normalizedValue,
  normalizedInnerCut,
  outerX,
  outerY,
  arcWidth,
} = usePieArc({ value, gap, hoverScale, innerCut, rounded }, active)

const arcSize = toRef(() => state.value === 'initial' ? 0 : normalizedValue.value)
const currentArcSize = useTransition(arcSize, transition)

const angle = toRef(() => state.value === 'initial' ? 0 : (rotate + gap / 2))
const currentAngle = useTransition(angle, transition)

const arcRadius = toRef(() => 50 * (active.value ? 1 : (1 - hoverZoomRatio.value)))
const currentArcRadius = useTransition(arcRadius, transition)
const currentArcWidth = useTransition(arcWidth, transition)

const outerSlicePath = useOuterSlicePath({
  angle: currentAngle,
  radius: currentArcRadius,
  size: currentArcSize,
  width: currentArcWidth,
  rounded
})
const innerSlicePath = useInnerSlicePath({
  angle: currentAngle,
  radius: currentArcRadius.value - currentArcWidth.value,
  size: currentArcSize
})

const overlayPath = toRef(() => `M 50 0 A 50 50 0 ${normalizedValue.value > 50 ? 1 : 0} 1 ${outerX.value} ${outerY.value} L 50 50`)

function setActive(val: boolean) {
  active.value = val
}

onMounted(async () => {
  if (reveal) {
    state.value = 'initial'
    await new Promise(resolve => requestAnimationFrame(resolve))
    state.value = 'pending'
    await new Promise(resolve => setTimeout(resolve, duration))
    state.value = 'done'
  }
})
</script>

<template>
<g
  class='v-pie-segment'
  :style='{ color: color }'
>
  <path
    key='outer-slice'
    fill='currentColor'
    shape-rendering='geometricPrecision'
    :d='outerSlicePath'
  />
  <path
    v-if='pattern'
    key='pattern-overlay'
    shape-rendering='geometricPrecision'
    :fill='pattern'
    :d='outerSlicePath'
  />
  <path
    v-if='!hide && normalizedInnerCut > 0'
    key='inner-slice'
    fill='transparent'
    :d='innerSlicePath'
  />
  <path
    v-if='["disabled", "done"].includes(state)'
    :transform='`rotate(${currentAngle} 50 50)`'
    class='v-pie-segment__overlay'
    :d='overlayPath'
    fill='transparent'
    @mouseenter.passive='setActive(true)'
    @mouseleave.passive='setActive(false)'
  />
</g>
</template>

<style scoped lang='scss'>
</style>