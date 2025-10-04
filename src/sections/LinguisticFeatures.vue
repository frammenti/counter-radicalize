<script setup lang='ts'>
import { ref, useTemplateRef, defineAsyncComponent, computed } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useThrottleFn } from '@vueuse/core'
import usePalette from '@/composables/usePalette'
import { BiMap } from '@/utils'
import colors from '@/assets/styles/emotions-pie.module.scss'
import stats from '@/stores/stats.json'
import type { AlignedSegment } from '@/types/segment'

const PieChart = defineAsyncComponent(() => import('@/components/PieChart.vue'))

defineProps<{ segments: AlignedSegment[] }>()
const pagination = useTemplateRef('pagination')
const tab = ref('emotions')

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

const _palettes = usePalette(colors)

const palettes = computed(() => Object.fromEntries(
  Object.entries(data).map(([key, items]) => 
    [
      key,
      items.map(({ title }) => {
        const normTitle = title.toLowerCase().replace(' ', '-')
        const itemColors = _palettes.value[key][normTitle] ??
                           _palettes.value[key][labels[key as Dimension]?.revGet(normTitle)]
        if (!itemColors) return { color: null, pattern: null }
        const { color, pattern } = itemColors
        return { color, pattern }
      })
    ]
)))

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
  <h2>Linguistic features</h2>
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
    tooltip
    reveal
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
  .pagination .button:hover:after { background-color: resp($text-color) }
}

@media screen and (width < $laptop) {
  .grid {
    height: unset;

    :first-child {
      grid-row: 1 / 2;
    }
    :nth-child(3),
    :last-child {
      grid-column: 1 / 3;
    }
  }
}

@media screen and (width < $tablet) {
  .grid {
    grid-template-columns: 100%;
    grid-template-rows: 3fr 2fr 0.5fr 0.5fr;
    height: unset;

    :first-child {
      grid-row: 2 / 3;
    }
    :nth-child(2) {
      grid-row: 1 / 2;
    }
    :nth-child(3),
    :last-child {
      grid-column: 1 / 2;
    }
  }
}
</style>
