<script setup lang='ts'>
import { computed } from 'vue'
import PieChart from '@/components/PieChart.vue'
import usePalette from '@/composables/usePalette'
import { BiMap, capitalize } from '@/utils'
import colors from '@/assets/styles/pie-chart.module.scss'
import stats from '@/stores/stats.json'
import type { AlignedSegment, Stats } from '@/types/segment'

const { facet } = defineProps<{ facet: keyof Stats }>()

// Active Pie Slice
const activeSlice = defineModel({
  get(value: keyof Stats['emotions'] | keyof Stats['fluency'] | undefined) {
    if (!value) return undefined
    const i = fData.value.findIndex(item => item.title === value)
    return i >= 0 ? i : undefined
  },
  set(i: number) {
    return i === undefined
      ? undefined
      : fData.value[i]?.title
  }
})

// Data prep
type Dimension = keyof AlignedSegment['dimensions']

const labels: { [k in Dimension]: BiMap<{ high: string, low: string }> } = {
  valence: new BiMap({ high: 'positive', low: 'negative' }),
  arousal: new BiMap({ high: 'excited', low: 'calm' }),
  dominance: new BiMap({ high: 'empowered', low: 'submissive'})
} as const

const data = Object.fromEntries(
  Object.entries(stats).map(([key, val]) =>
    [
      key,
      typeof val === 'object'
        ? Object.entries(val).map(([k, v]) => ({ title: k, value: v }))
        : [
            { title: labels[key as Dimension].get('high'), value: val },
            { title: labels[key as Dimension].get('low'), value: 1 - val }
          ]
    ]
  )
)

for (const k in data) {
  data[k].sort((a, b) => b.value - a.value)
}

const _palette = usePalette(colors)

const palette = computed(() => Object.fromEntries(
  Object.entries(data).map(([key, items]) => 
    [
      key,
      items.map(({ title }) => {
        const normTitle = title.toLowerCase().replace(' ', '-')
        const itemColors = _palette.value[key][normTitle] ??
                           _palette.value[key][labels[key as Dimension]?.revGet(normTitle)]
        if (!itemColors) return { color: null, pattern: null }
        const { color, pattern } = itemColors
        return { color, pattern }
      })
    ]
)))

const fData = computed(() => data[facet])
const fPalette = computed(() => palette.value[facet])
</script>

<template>
<PieChart
  v-model='activeSlice'
  :items='fData'
  :palette='fPalette'
  :label='`${capitalize(facet)} statistics`'
  :size='510'
  :inner-cut='50'
  :gap='2'
  :rounded='2'
  tooltip
  reveal
/>
</template>
