<script setup lang='ts'>
import { defineAsyncComponent, useTemplateRef } from 'vue'
import Tip from '@/components/Tip.vue'
import usePalette from '@/composables/usePalette'
import colors from '@/assets/styles/emotions-graph.module.scss'
import fluency from '@/stores/fluency.json'
import type { AlignedSegment } from '@/types/segment'

const props = defineProps<{ segments: AlignedSegment[] }>()
const section = useTemplateRef('section')
const PlotFigure = defineAsyncComponent(() => import('@/components/PlotFigure.vue'))

const data = props.segments.flatMap(({ start, emotions, dimensions }) =>
  Object.entries(emotions).map(([type, value]) => ({
    time: new Date(start * 1000),
    type,
    value,
    valence: dimensions.valence,
    arousal: dimensions.arousal
  }))
)

const palette = usePalette(colors)
const hasMouse = window.matchMedia('(pointer: fine)').matches
</script>

<template>
<section id='distant-reading' class='paginated' aria-label='Distant reading' ref='section'>
  <Tip :anchor='section' title='How to navigate'>
    <template v-if='hasMouse'>
      Click once to set playback position. Click again to clear.
    </template>
    <template v-else>
      Drag to pan the graph. Tap to set playback position.
    </template>
  </Tip>
  <hgroup>
    <h2>Distant reading</h2>
  </hgroup>
  <PlotFigure
  :axis-options="{
    height: 610,
    marginLeft: 37,
    marginTop: 30,
    marginRight: 20,
    x: { type: 'utc', label: 'mins', ticks: 0, line: true },
    y: {
      percent: true,
      grid: true,
      label: '%',
      domain: [0, 100],
      labelArrow: 'none'
    },
    facet: { data: [0, 1, 2, 3], y: (d: number) => d, label: null },
    fy: {
      tickFormat: (d: number) => ['Emotions', 'Arousal', 'Valence', 'Fluency'][d],
      tickRotate: 90,
      tickPadding: 20
    }
  }"
  :options="{
    width: 1136,
    height: 610,
    marginTop: 30,
    marginRight: 20,
    x: { type: 'utc', label: null },
    y: { percent: true, label: null, ticks: 0 },
    fy: { tickFormat: null },
    color: {
      type: 'categorical',
      range: Object.values(palette.emotions),
      domain: Object.keys(palette.emotions)
    },
    marks: [
      {
        type: 'axisX',
        options: {
          ticks: 'minute',
          tickFormat: (d: Date) => d.getMinutes()
        }
      },
      {
        type: 'areaY',
        data: data,
        options: {
          type: 'windowY',
          options: {
            k: 3,
            x: 'time',
            y: 'value',
            fill: 'type',
            title: 'type',
            curve: 'basis',
            fy: 0
          }
        }
      },
      {
        type: 'lineY',
        data: data,
        options: {
          x: 'time',
          y: 'arousal',
          z: null,
          stroke: 'url(#arousal)',
          curve: 'monotone-x',
          fy: 1
        }
      },
      {
        type: 'lineY',
        data: data,
        options: {
          x: 'time',
          y: 'valence',
          z: null,
          stroke: 'url(#valence)',
          curve: 'monotone-x',
          fy: 2
        }
      },
      {
        type: 'lineY',
        data: fluency,
        options: {
          type: 'windowY',
          options: {
            k: 20,
            x: d => d.time * 1000,
            y: 'fluency',
            z: null,
            stroke: 'url(#fluency)',
            curve: 'basis',
            fy: 3
          }
        }
      }
    ]
  }"
  :pointer-options="{
    width: 1136,
    height: 610,
    marginTop: 30,
    marginRight: 20,
    marginLeft: 40,
    x: {
      type: 'utc',
      label: null,
      ticks: 0,
      domain: [0, data[data.length - 1].time]
    },
    marks: [
      {
        type: 'ruleX',
        data: data,
        options: {
          type: 'pointerX',
          options: {
            x: 'time',
            stroke: palette.primary,
            strokeWidth: 2
          }
        }
      },
      {
        type: 'textX',
        data: data,
        options: {
          type: 'pointerX',
          options: {
            x: 'time',
            fill: palette.primary,
            stroke: palette.background,
            strokeWidth: 10,
            frameAnchor: 'bottom',
            lineAnchor: 'top',
            lineHeight: 4.5,
            text: d => `${d.time.getMinutes()}:${String(d.time.getSeconds()).padStart(2,'0')}`
          }
        }
      }
    ]
  }"
  :time-marker-options="{
    width: 1136,
    height: 610,
    marginTop: 30,
    marginRight: 20,
    marginLeft: 40,
    x: {
      type: 'utc',
      label: null,
      ticks: 0,
      domain: [0, data[data.length - 1].time]
    },
    marks: [
      {
        type: 'ruleX',
        options: {
          stroke: palette.secondary,
          strokeWidth: 1,
          strokeOpacity: 0.7
        }
      },
      {
        type: 'textX',
        options: {
          fill: palette.secondary,
          stroke: palette.background,
          strokeWidth: 10,
          frameAnchor: 'bottom',
          lineAnchor: 'top',
          lineHeight: 4.5,
          text: d => `${d.getMinutes()}:${String(d.getSeconds()).padStart(2,'0')}`
        }
      }
    ]
  }"
  :gradients="[
    {
      id: 'arousal',
      min: 0,
      max: 0.8,
      low: palette.arousal.low,
      high: palette.arousal.high
    },
    {
      id: 'valence',
      min: 0,
      max: 0.8,
      low: palette.valence.low,
      high: palette.valence.high
    },
    {
      id: 'fluency',
      min: 0.15,
      max: 1,
      low: palette.fluency.low,
      high: palette.fluency.high
    }
  ]"
  :legends="[
    {
      color: {
        type: 'categorical',
        range: Object.values(palette.emotions),
        domain: Object.keys(palette.emotions)
      },
      className: 'emotions'
    },
    {
      color: {
        type: 'categorical',
        range: [palette.arousal.low, palette.arousal.high],
        domain: ['calm', 'excited']
      },
      className: 'arousal'
    },
    {
      color: {
        type: 'categorical',
        range: [palette.valence.low, palette.valence.high],
        domain: ['negative', 'positive']
      },
      className: 'valence'
    },
    {
      color: {
        type: 'categorical',
        range: [palette.fluency.low, palette.fluency.high],
        domain: ['disfluent', 'fluent']
      },
      className: 'fluency'
    },
  ]" />
</section>
</template>

<style scoped lang='scss'>
@media screen and (width < $laptop) {
  :deep(.plot) {
    margin-right: 0.3rem !important;
  }
}
</style>
