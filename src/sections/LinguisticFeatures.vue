<script setup lang='ts'>
import { ref, useTemplateRef, computed, defineAsyncComponent } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useThrottleFn } from '@vueuse/core'
import usePalette from '@/composables/usePalette'
import { sortMask, applyMask } from '@/utils'
import colors from '@/assets/styles/emotions-pie.module.scss'
import stats from '@/stores/stats.json'
import type { AlignedSegment } from '@/types/segment'

const PieChart = defineAsyncComponent(() => import('@/components/PieChart.vue'))

defineProps<{ segments: AlignedSegment[] }>()
const pagination = useTemplateRef('pagination')
const tab = ref('fluency')

// Data prep
type DataItem = { title: string, value: number }
type DataMap = Record<string, DataItem[]>
type OrderMap = Record<string, number[]>

const labels: Record<string, string[]> = {
  valence: ['positive', 'negative'],
  arousal: ['excited', 'calm'],
  dominance: ['empowered', 'submissive']
}

const { data, dataOrder } = Object.entries(stats).reduce(
  (acc, [key, val]) => {
    const group =
      typeof val === 'object'
        ? Object.entries(val).map(([k, v]) => ({ title: k, value: v }))
        : [
            { title: labels[key][0], value: val },
            { title: labels[key][1], value: 1 - val }
          ]
    // Sorts group in place
    acc.dataOrder[key] = sortMask(group, (a, b) => b.value - a.value)
    acc.data[key] = group

    return acc
  },
{ data: {} as DataMap, dataOrder: {} as OrderMap }
)

const _palettes = usePalette(colors)
const colorRe = /(?<=\s)\w+(?=\s)|#\w+|\w+\([^\)]+\)/g

const palettes = computed<Record<string, string[]>>(() =>
  Object.fromEntries(
    Object.entries(_palettes.value)
      .map(([k, v ]) => [k, applyMask(v.match(colorRe), dataOrder[k])])
    )
)

// Navigation
let touchStartX = 0
const touchThreshold = 50
const wheelThreshold = 10

function forward(direction: 'ArrowRight' | 'ArrowLeft') {
  const active = pagination.value!.$el.querySelector('[data-active]') as HTMLElement | null
  if (!active) return

  const e = new KeyboardEvent('keydown', {
    key: direction,
    bubbles: true,
  })
  // @ts-ignore
  active.focus({ preventScroll: true, focusVisible: false })
  active.dispatchEvent(e)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(deltaX) < touchThreshold) return

  const direction = deltaX < 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}

const onWheel = useThrottleFn((e: WheelEvent) => {
  if (
    Math.abs(e.deltaX) < Math.abs(e.deltaY) ||
    Math.abs(e.deltaX) < wheelThreshold
  ) return

  const direction = e.deltaX > 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}, 300)
</script>

<template>
<section id='linguistic-features' class='paginated' aria-label='Linguistic features'>
  <hgroup>
    <h2>Linguistic features</h2>
  </hgroup>
  <div class='grid'>
  <TabsRoot
    class='tabs-root card'
    v-model='tab'
    @touchstart.passive='onTouchStart'
    @touchend.passive='onTouchEnd'
    @wheel.passive='onWheel'
  >
    <TabsList class='pagination' aria-label='' ref='pagination'>
      <TabsTrigger class='button' value='emotions' />
      <TabsTrigger class='button' value='valence' />
      <TabsTrigger class='button' value='arousal' />
      <TabsTrigger class='button' value='dominance' />
      <TabsTrigger class='button' value='fluency' />
    </TabsList>
    <TabsContent value='emotions' tabindex='-1'>
      <h3>Emotions</h3>
      <p>
        Emotions are complex. Emotions are heavy. Emotions are an excuse.
      </p>
    </TabsContent>
    <TabsContent value='valence' tabindex='-1'>
      <h3>Valence</h3>
      <p>
        I'm very very very.
      </p>
    </TabsContent>
    <TabsContent value='arousal' tabindex='-1'>
      <h3>Arousal</h3>
      <p>
        If you are happy and you know it clap your hands.
      </p>
    </TabsContent>
    <TabsContent value='dominance' tabindex='-1'>
      <h3>Dominance</h3>
      <p>
        Rawwwwr!
      </p>
    </TabsContent>
    <TabsContent value='fluency' tabindex='-1'>
      <h3>Fluency</h3>
      <p>
        Ehm
      </p>
    </TabsContent>
  </TabsRoot>
  <PieChart 
    :items='data[tab]'
    :palette='palettes[tab]'
    :size='400'
    :inner-cut='50'
    :gap='2'
    :rounded='2'
  />
  <div class='card'></div>
  <div class='card'></div>
  </div>
</section>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 2fr 0.5fr 0.5fr;
  gap: 2rem;
  height: 80%;

  :first-child {
    grid-row: 1 / 4;
  }
}
.card {
  height: 100%;
}
.pagination {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: start;
  gap: 0.5rem;

  .button {
    border-radius: $max-radius;
    height: 30px;
    width: 30px;
    padding: 0;
    border: 1px solid transparent;
    background: none;
    position: relative;
    box-shadow: none;
    will-change: border-color;
    transition: border-color 150ms ease;

    &:after {
      content: '';
      height: 10px;
      width: 10px;
      border-radius: $max-radius;
      background-color: resp($border-color);
      position: absolute;
      top: 33%;
      left: 33%;
      will-change: background-color;
      transition: background-color 150ms ease;
    }

    &[data-active] {
      border-color: resp($text-color);
      &:after { background-color: resp($text-color); }
    }
  }
}

@media (hover: hover) {
  .pagination .button:hover:after { background-color: resp($text-color); }
}
</style>
