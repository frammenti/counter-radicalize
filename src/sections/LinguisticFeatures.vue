<script setup lang='ts'>
import { defineAsyncComponent, computed } from 'vue'
import { useDark } from '@vueuse/core'
import emotionColors from '@/assets/styles/emotions-resp.module.scss'
import segments from '@/stores/segments.json'
import type { EmotionSegment } from '@/types/emotion-segment'

const PlotFigure = defineAsyncComponent(() => import('@/components/PlotFigure.vue'))

const data = segments.flatMap(({ start, emotions, dimensions }) =>
  Object.entries(emotions).map(([type, value]) => ({
    time: new Date(start * 1000),
    type,
    value,
    arousal: dimensions.arousal
  }))
)

type Scheme = 'light' | 'dark'
type Emotion = keyof EmotionSegment['emotions']
type Schemes = Record<Scheme, Record<Emotion, string>>

const schemes: Schemes = { light: {} as Record<Emotion, string>, dark: {} as Record<Emotion, string> }

for (const key in emotionColors) {
  const [scheme, label] = key.split('-') as [Scheme, Emotion]
  schemes[scheme][label] = emotionColors[key]
}

const isDark = useDark()
const scheme = computed(() => (isDark.value ? schemes.dark : schemes.light))
</script>

<template>
<section id='distant-reading' class='paginated' aria-label='Linguistic features'>
  <hgroup>
    <h2>Linguistic features</h2>
  </hgroup>
  <p>Valence, arousal etc.</p>
  <PlotFigure
  :axis-options="{
    height: 400,
    marginLeft: 37,
    marginRight: 20,
    x: { type: 'utc', label: 'mins', ticks: 0, line: true },
    y: { percent: true, grid: true, label: '%', domain: [0, 100], labelArrow: 'none' },
    facet: { data: [0, 1], y: (d: number) => d, label: null },
    fy: { tickFormat: (d: number) => ['Emotions', 'Arousal'][d], tickRotate: 90, tickPadding: 20 }
  }"
  :options="{
    width: 1136,
    height: 400,
    marginRight: 20,
    x: { type: 'utc', label: null },
    y: { percent: true, label: null, ticks: 0 },
    fy: { tickFormat: null },
    color: { type: 'categorical', range: Object.values(scheme), domain: Object.keys(scheme) },
    marks: [
      { type: 'axisX', options: { ticks: 'minute', tickFormat: (d: number) => Math.floor(d / 60000) }},
      { type: 'areaY', data: data, options: { x: 'time', y: 'value', fill: 'type', title: 'type', curve: 'basis', fy: 0 }},
      { type: 'lineY', data: data, options: { x: 'time', y: 'arousal', curve: 'linear', fy: 1 }}
    ]
  }"
  :pointer-options="{
    width: 1136,
    height: 400,
    marginRight: 20,
    marginTop: 20,
    x: { type: 'utc', label: null, ticks: 0, domain: [0, data[data.length - 1].time] },
    marks: [
      { type: 'ruleX', data: data, options: { type: 'pointerX', options: { x: 'time', stroke: isDark ? 'oklch(0.7935 0.10034 276.98)' : 'oklch(0.4668 0.19179 337.977)', strokeWidth: 2 }}}
    ]
  }"
  />
</section>
</template>

<style scoped lang='scss'>
#distant-reading {
  max-height: unset;
  height: 100dvh;
}
</style>
