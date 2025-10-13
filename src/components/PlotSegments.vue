<script setup lang='ts'>
import PlotFigure from '@/components/PlotFigure.vue'
import usePalette from '@/composables/usePalette'
import colors from '@/assets/styles/graph.module.scss'
import fluency from '@/stores/fluency.json'
import type { AlignedSegment } from '@/types/segment'
import { range, formatTime } from '@/utils'

const props = defineProps<{ segments: AlignedSegment[], width: number }>()

const data = props.segments.flatMap(({ start, emotions, dimensions }) =>
  Object.entries(emotions).map(([type, value]) => ({
    time: start,
    type,
    value,
    valence: dimensions.valence,
    arousal: dimensions.arousal
  }))
)

const palette = usePalette(colors)
</script>

<template>
<PlotFigure
  :axis-options="{
    height: 600,
    marginLeft: 37,
    marginTop: 30,
    marginRight: 30,
    x: { type: 'linear', label: 'mins', ticks: 0, line: true },
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
    width: width,
    height: 600,
    marginTop: 30,
    marginRight: 30,
    x: { type: 'linear', label: null },
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
          ticks: range(data[0].time, data[data.length - 1].time, 60),
          tickFormat: d => formatTime(d, false)
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
            x: d => d.time,
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
    width: width,
    height: 600,
    marginTop: 30,
    marginRight: 30,
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
            text: d => formatTime(d.time)
          }
        }
      }
    ]
  }"
  :time-marker-options="{
    width: width,
    height: 600,
    marginTop: 30,
    marginRight: 30,
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
          text: d => formatTime(d)
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
  ]"
/>
</template>
