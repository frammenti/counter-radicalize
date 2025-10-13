// Simplified chart inspired by https://vuetifyjs.com/en/components/pie-charts/

<script setup lang='ts'>
import { computed, ref, defineAsyncComponent } from 'vue'
import PieSlice from '@/components/PieSlice.vue'
import usePalette from '@/composables/usePalette'
import patternThemes from '@/assets/styles/patterns.module.scss'
import { capitalize, round } from '@/utils'

const TooltipCursor = defineAsyncComponent(() => import('@/components/TooltipCursor.vue'))

const {
  items,
  palette = [],
  itemValue = 'value',
  itemTitle = 'title',
  rotate = 0,
  gaugeCut = 0,
  min = 0.01, // the minimum value to normalize small values > 0
  tooltip = false,
  gap,
  innerCut,
  rounded,
  hoverScale,
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
  reveal?: boolean
  animation?: (t: number) => number
  duration?: number
}>()

const segmentProps = {
  gap,
  innerCut,
  rounded,
  hoverScale,
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
}

// Color and pattern getters
type Palette = { color: string | null; pattern: string | null }[] | (string | null)[]

function onlyColors(p: Palette): p is (string | null)[] {
  return typeof p[0] === 'string'
}

const patterns = usePalette(patternThemes)

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
        pattern: item.pattern ?? pattern(i)
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

const gaugeOffset = (1 - Math.cos(Math.PI * Math.min(90, gaugeCut / 2) / 180)) / 2
const rotateDeg = `${gaugeCut > 0 ? (180 + gaugeCut / 2) : rotate}deg`

function arcOffset(index: number) {
  return arcs.value
    .slice(0, index)
    .reduce((acc, s) => acc + (total.value > 0 ? norm(s.value) / total.value : 0) * (360 - gaugeCut), 0)
}

function arcSize(v: number) { return norm(v) / total.value * (100 - gaugeCut / 3.6) }

// Active item
const activeIdx = defineModel<number | undefined>('active-idx', { type: Number, required: false, default: undefined })
const anchor = ref({ x: 0, y: 0 })
</script>

<template>
<div class='pie-chart'>
  <slot></slot>
  <div
    class='pie-content'
    :style='{
      maxWidth: size ? `${size}px` : "none",
      transform: `rotate(${rotateDeg})`,
      marginInline: `calc(-1 * ${size}px * ${gaugeOffset})`,
    }'
  >
    <TooltipCursor
      v-if='tooltip'
      :anchor='anchor'
      :open='activeIdx !== undefined'
      min-width='8rem'
      height='3.6rem'
    >
        <div class='tooltip-content' v-if='activeIdx !== undefined'>
          <div class='tooltip-legend'
            :style='{
              backgroundColor: arcs[activeIdx].color,
              backgroundImage: patterns[arcs[activeIdx].pattern]?.url
            }'
          ></div>
          <div class='tooltip-text'>
            <div class='tooltip-title'>{{ capitalize(arcs[activeIdx].title) }}</div>
            <div class='tooltip-value'>
            {{ round(arcs[activeIdx].value) }} %
            </div>
          </div>
        </div>
    </TooltipCursor>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 100 100'
      class='pie-segments'
      pointer-events='fill'
      @pointermove='(e) => {
        anchor.x = e.clientX
        anchor.y = e.clientY
      }'
    >
      <defs>
        <template v-for='{svg: pattern}, _i in patterns' :key='_i'>
          <g v-html='pattern'></g>
        </template>
      </defs>
      <template v-for='item, i in arcs' :key='item.key'>
        <PieSlice
          v-if='item.value > 0'
          :active='activeIdx === i'
          v-bind='segmentProps'
          :color='item.color'
          :value='arcSize(item.value)'
          :rotate='arcOffset(i)'
          :pattern='item.pattern'
          @update:active='(isActive) => activeIdx = isActive ? i : undefined'
        />
      </template>
    </svg>
  </div>
</div>
</template>

<style lang='scss'>
.pie-chart {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
}
.pie-content {
  width: 100%;
  font-size: $fs-base;
}
.tooltip-content {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
  text-wrap: nowrap;
}
.tooltip-legend {
  height: 2.25rem;
  width: 2.25rem;
  border-radius: $radius-max;
  border: 1px solid;
  @include theme(border-color, border);
}
.tooltip-value {
  font-size: 0.8rem;
}
</style>
