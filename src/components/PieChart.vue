<script setup lang='ts'>
import { computed } from 'vue'
import PieSegment from '@/components/PieSegment.vue'

const {
  items,
  palette = [],
  itemValue = 'value',
  itemTitle = 'title',
  size = 250,
  rotate = 0,
  gaugeCut = 0,
  min = 0.01, // the minimum value to normalize small values > 0
  gap,
  innerCut,
  rounded,
  hoverScale,
  hide,
  reveal,
  animation,
  duration
} = defineProps<{
  items: Record<string, any>[]
  palette?: Palette
  itemValue?: string
  itemTitle?: string
  size?: number
  rotate?: number
  gaugeCut?: number
  min?: number
  tooltip?: boolean
  gap?: number
  innerCut?: number
  rounded?: number
  hoverScale?: number
  hide?: boolean
  reveal?: boolean
  animation?: (t: number) => number
  duration?: number
}>()

const segmentProps = {
  gap,
  innerCut,
  rounded,
  hoverScale,
  hide,
  reveal,
  animation,
  duration
}

// Types
interface PieItem {
  key: number | string
  color: string
  value: number
  title: string
  pattern: string
  active: boolean
}

type Palette = { color: string; pattern: string }[] | string[]

function onlyColors(p: Palette): p is string[] {
  return typeof p[0] === 'string'
}

// Color and pattern getters
let color: (i: number) => string | null = () => null
let pattern: (i: number) => string | null = () => null
if (palette.length === items.length) {
  if (onlyColors(palette)) {
    color = (i) => palette[i]
  } else {
    color = (i) => palette[i].color
    pattern = (i) => palette[i].pattern
  }
}

// Arcs
const arcs = computed<PieItem[]>(() => {
  return items
    .map((item: any, i: number) => {
      return {
        key: i,
        color: item.color ?? color(i),
        value: item[itemValue],
        title: item[itemTitle],
        pattern: item.pattern ?? pattern(i),
        active: false
      }
    })
})

function norm(v: number) {
  return v > min
   ? v
   : v > 0
     ? min
     : 0
}

const total = computed(() => arcs.value.reduce((sum, item) => sum + norm(item.value), 0))

const gaugeOffset = computed(() => (1 - Math.cos(Math.PI * Math.min(90, gaugeCut / 2) / 180)) / 2)
const rotateDeg = computed(() => `${gaugeCut > 0 ? (180 + gaugeCut / 2) : rotate}deg`)

function arcOffset(index: number) {
  return arcs.value
    .slice(0, index)
    .reduce((acc, s) => acc + (total.value > 0 ? norm(s.value) / total.value : 0) * (360 - gaugeCut), 0)
}

function arcSize(v: number) { return norm(v) / total.value * (100 - gaugeCut / 3.6) }
</script>

<template>
<div
  class='pie-chart'
  :style='{ width: `${size}px`}'
>
  <slot name='title'></slot>
  <div
    class='pie-chart-content'
    :style='{
      transform: `rotate(${rotateDeg})`,
      marginBottom: `calc(-1 * ${size}px * ${gaugeOffset})`,
    }'
  >
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      class='pie-chart-segments'
    >
      <template v-for='(item, i) in arcs' :key='item.key'>
      <PieSegment
        v-if='item.value > 0'
        v-bind='segmentProps'
        :color='item.color'
        :value='arcSize(item.value)'
        :rotate='arcOffset(i)'
        :pattern='item.pattern'
        @update:active='val => arcs[i].active = val'
        @touchend='arcs[i].active = true'
      />
      </template>
    </svg>
  </div>
</div>
</template>

<style lang='scss'>
</style>
