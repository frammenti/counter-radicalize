<script setup lang='ts'>
import { computed } from 'vue'
import TranscriptFeaturesItem from '@/components/TranscriptFeaturesItem.vue'
import type { EmotionSegment } from '@/types/emotion-segment'

const props = defineProps<{ data: EmotionSegment['dimensions'] }>()

function getCutoff(n: number) {
  for (const cut of [0.25, 0.5, 0.75, 1]) {
    if (n + 0.005 <= cut) return cut
  }
  return 0
}

// Map arousal range (0.15-0.8) to 50-100% of the font size
const arousalSize = computed<string>(() => 50 + (props.data.arousal - 0.15) * (50 / 0.65) + '%')
</script>

<template>
<Transition name='list' appear>
  <ul class='feature-list'>
    <li
      v-for="v, k in data"
      :key='k'
      class='dimension'
      :class='k'
      :data-value='getCutoff(v)'
    >
      <TranscriptFeaturesItem
        :label='k'
        :value='v'
        :short='k.slice(0, 3) + "."'
      />
    </li>
  </ul>
</Transition>
</template>

<style scoped lang='scss'>
@include set-icon-legend($dimensions);
.dimension {
  height: 1.5em;
  min-width: 1.5em;
}
/* Inherit height and width to allow for global font resize but avoid inteference from the arousal block */
.dimension:before {
  display: inline-flex;
  height: inherit;
  min-width: inherit;
  margin-inline-end: 0.1rem;
  align-items: center;
  justify-content: center;
}
.arousal:before {
  font-size: v-bind('arousalSize');
}
</style>
