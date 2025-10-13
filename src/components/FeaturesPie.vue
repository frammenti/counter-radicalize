<script setup lang='ts'>
import { ref, computed } from 'vue'
import PieChart from '@/components/PieChart.vue'
import usePalette from '@/composables/usePalette'
import { BiMap } from '@/utils'
import colors from '@/assets/styles/pie-chart.module.scss'
import stats from '@/stores/stats.json'
import type { AlignedSegment, Stats } from '@/types/segment'

const { facet, subfacet } = defineProps<{
  facet: keyof Stats
  subfacet?: keyof Stats['emotions'] | keyof Stats['fluency']
}>()

const emit = defineEmits<{
  'update:subfacet': [title?: string, color?: string]
}>()

// Active Pie Slice
const activeSliceIdx = ref<number | undefined>()

const activeSlice = computed<number | undefined>({
  get(prev) {
    if (!subfacet) return
    if (prev === activeSliceIdx.value) return prev
    const idx = fData.value.findIndex((item) => item.title === subfacet)
    return idx >= 0 ? idx : undefined
  },
  set(i?: number) {
    activeSliceIdx.value = i
  }
})

const activeSliceData = computed<[title?: string, color?: string]>(() => {
  if (activeSliceIdx.value === undefined) return [undefined, undefined]
  return [
    fData.value[activeSliceIdx.value].title,
    fPalette.value[activeSliceIdx.value].color,
  ]
})

function updateSubfacet(i?: number) {
  activeSlice.value = i
  emit("update:subfacet", ...activeSliceData.value)
}


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
  :items='fData'
  :palette='fPalette'
  :size='540'
  :inner-cut='50'
  :gap='2'
  :rounded='2'
  tooltip
  reveal
  :active='activeSlice'
  @update:active-idx='updateSubfacet'
/>
</template>
