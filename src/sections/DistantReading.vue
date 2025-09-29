<script setup lang='ts'>
import { defineAsyncComponent, computed, useTemplateRef } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import Tip from '@/components/Tip.vue'
import emotionColors from '@/assets/styles/emotions-resp.module.scss'
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

type Scheme = 'light' | 'dark'
type Emotion = keyof AlignedSegment['emotions']

const schemes = {
  light: {
    emotions: {} as Record<Emotion, string>,
    valence: [
      emotionColors.light_sadness,
      'oklch(0.8813 0.2005 99.88)'
    ],
    arousal: [
      emotionColors.dark_neutral,
      emotionColors.light_anger
    ],
    fluency: [
      emotionColors.light_fear,
      emotionColors.light_disgust
    ]
  },
  dark: {
    emotions: {} as Record<Emotion, string>,
    valence: [
      emotionColors.dark_sadness,
      emotionColors.dark_happiness
    ],
    arousal: [
      emotionColors.dark_neutral,
      emotionColors.dark_anger
    ],
    fluency: [
      emotionColors.dark_fear,
      emotionColors.dark_disgust
    ]
  }
}

for (const key in emotionColors) {
  const [scheme, label] = key.split('_') as [Scheme, Emotion]
  schemes[scheme]['emotions'][label] = emotionColors[key]
}

const dark = usePreferredDark()
const scheme = computed(() => (dark.value ? schemes.dark : schemes.light))
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
      range: Object.values(scheme.emotions),
      domain: Object.keys(scheme.emotions)
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
            stroke: dark
            ? 'oklch(0.7935 0.10034 276.98)'
            : 'oklch(0.4668 0.19179 337.977)',
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
            fill: dark
            ? 'oklch(0.7935 0.10034 276.98)'
            : 'oklch(0.4668 0.19179 337.977)',
            stroke: dark
            ? 'oklch(0.2256 0.00468 17.205)'
            : 'oklch(0.9985 0.00011 360)',
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
          stroke: dark
          ? 'oklch(0.7935 0.10034 96.98)'
          : 'oklch(0.4668 0.19179 137.977)',
          strokeWidth: 1,
          strokeOpacity: 0.7
        }
      },
      {
        type: 'textX',
        options: {
          fill: dark
          ? 'oklch(0.7935 0.10034 96.98)'
          : 'oklch(0.4668 0.19179 137.977)',
          stroke: dark
          ? 'oklch(0.2256 0.00468 17.205)'
          : 'oklch(0.9985 0.00011 360)',
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
      low: scheme.arousal[0],
      high: scheme.arousal[1]
    },
    {
      id: 'valence',
      min: 0,
      max: 0.8,
      low: scheme.valence[0],
      high: scheme.valence[1]
    },
    {
      id: 'fluency',
      min: 0.15,
      max: 1,
      low: scheme.fluency[0],
      high: scheme.fluency[1]
    }
  ]"
  :legends="[
    {
      color: {
        type: 'categorical',
        range: Object.values(scheme.emotions),
        domain: Object.keys(scheme.emotions)
      },
      className: 'emotions'
    },
    {
      color: {
        type: 'categorical',
        range: scheme.arousal,
        domain: ['calm', 'excited']
      },
      className: 'arousal'
    },
    {
      color: {
        type: 'categorical',
        range: scheme.valence,
        domain: ['negative', 'positive']
      },
      className: 'valence'
    },
    {
      color: {
        type: 'categorical',
        range: scheme.fluency,
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
