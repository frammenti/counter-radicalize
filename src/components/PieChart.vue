// Simplified chart inspired by https://vuetifyjs.com/en/components/pie-charts/

<script setup lang='ts'>
import { ref, shallowRef, useTemplateRef, computed, watch, defineAsyncComponent, type ComponentPublicInstance } from 'vue'
import { RovingFocusGroup } from 'reka-ui'
import PieSlice from '@/components/PieSlice.vue'
import usePalette from '@/composables/usePalette'
import { canHover, isMobile } from '@/stores/state'
import patternThemes from '@/assets/styles/patterns.module.scss'
import { capitalize, round } from '@/utils'

const TooltipCursor = defineAsyncComponent(() => import('@/components/TooltipCursor.vue'))

const {
  items,
  palette = [],
  itemValue = 'value',
  itemTitle = 'title',
  label,
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
  label?: string
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
// Selected slice, emitted
const locked = defineModel<number | undefined>('modelValue', {
  set(i) {
    return i !== locked.value
      ? i
      : undefined
  },
  get(i) {
    return i !== undefined && arcs.value[i].value > 0
      ? i
      : undefined
  }
})

// Local hover state, internal
const hovered = ref<number>()

const active = computed(() => locked.value ?? hovered.value)

const svg = useTemplateRef('svg')
const rect = computed(() => svg.value?.getBoundingClientRect())
const slices = shallowRef(new Map<number, ComponentPublicInstance<typeof PieSlice>>())
const anchor = ref({ x: 0, y: 0 })
const tooltipHeight = computed(() => isMobile.value ? 52 : 57.6)
const tooltipWidth = computed(() => isMobile.value ? 104 : 128)

function center(i: number) {
  const slice = slices.value.get(i)
  const tot = rect.value
  if (!(slice && tot)) return { x: 0, y: 0 }

  const { width, height } = tot
  const center = { x: width / 2, y: height / 2 }

  let x = slice.center.x / 100 * width
  let y = slice.center.y / 100 * height

  if (isMobile.value) {
    const factor = 0.6
    x = center.x + (x - center.x) * factor
    y = center.y + (y - center.y) * factor
  }

  x -= tooltipWidth.value / (isMobile.value ? 2 : 4)
  y += tooltipHeight.value / 2

  return { x, y }
}

watch(locked, (n, o) => {
  if (n === undefined) return
  if (canHover && hovered.value === n && o === undefined) return
    anchor.value = center(n)
}, { flush: 'post' })

watch(() => items, () => {
  locked.value = undefined
  hovered.value = undefined
}, { flush: 'pre' })
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
      :open='active !== undefined'
      :min-width='`${tooltipWidth}px`'
      :height='`${tooltipHeight}px`'
    >
        <div class='tooltip-content' v-if='active !== undefined'>
          <div class='tooltip-legend'
            :style='{
              backgroundColor: arcs[active].color,
              backgroundImage: patterns[arcs[active].pattern]?.url
            }'
          ></div>
          <div class='tooltip-text'>
            <div class='tooltip-title'>{{ capitalize(arcs[active].title) }}</div>
            <div class='tooltip-value'>
            {{ round(arcs[active].value) }}%
            </div>
          </div>
        </div>
    </TooltipCursor>
    <RovingFocusGroup
      :current-tab-stop-id='locked ? items[locked].title : null'
      orientation='horizontal'
      :prevent-scroll-on-entry-focus='true'
      loop
      as-child
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 100 100'
        ref='svg'
        class='pie-segments'
        @pointermove='(e) => {
          if (locked !== undefined || !canHover) return
          anchor.x = e.offsetX
          anchor.y = e.offsetY
        }'
        pointer-events='none'
        overflow='visible'
        role='figure'
        :aria-label='label'
        aria-roledescription='pie chart'
      >
        <defs>
          <template v-for='{svg: pattern}, _i in patterns' :key='_i'>
            <g v-html='pattern'></g>
          </template>
        </defs>
        <circle class='outline' cx='50' cy='50' r='52' stroke='none' fill='none' pointer-events='none' stroke-width='1px' stroke-linecap='round' stroke-linejoin='round' />
        <template v-for='item, i in arcs' :key='item.key'>
          <PieSlice
            v-if='item.value > 0'
            :ref="(el: any) => { if (el) slices.set(i, el) }"
            :active='active === i'
            v-bind='segmentProps'
            :label='capitalize(item.title)'
            :color='item.color'
            :value='arcSize(item.value)'
            :rotate='arcOffset(i)'
            :pattern='item.pattern'
            @update:active='isActive => hovered = isActive ? i : undefined'
            @lock='locked = i'
          />
        </template>
      </svg>
    </RovingFocusGroup>
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
  -webkit-tap-highlight-color: $transparent;
}
.pie-content {
  width: 100%;
  font-size: $fs-base;
}
.pie-segments {
  &:focus, &:focus-visible {
    outline: none;
  }
  
  &:focus-visible {
   .outline { @include theme(stroke, primary-text); }
  }
}
.tooltip {
  &-content {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: start;
    gap: 1em;
    font-size: $fs-base;
    text-wrap: nowrap;
    text-align: start;
  }
  &-legend {
    flex-shrink: 0;
    height: 1.6lh;
    width: 1.6lh;
    border-radius: $radius-max;
    border: 1px solid;
    @include theme(border-color, border);
  }
  &-value {
    font-size: $fs-xs;
  }
}

@media screen and (width >= $tablet) {
  .tooltip {
    &-content {
      font-size: $fs-m;
    }
    &-value {
      font-size: $fs-s;
    }
  }
}
</style>
