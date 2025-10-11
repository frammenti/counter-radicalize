<script setup lang='ts'>
import TranscriptFeaturesItem from '@/components/TranscriptFeaturesItem.vue'
import { dummy, type AlignedSegment } from '@/types/segment'

defineProps<{ data?: AlignedSegment }>()
</script>

<template>
<ul class='feature-list'>
  <li v-for='v, k in data ? data.dimensions : dummy.dimensions' :key='k'>
    <TranscriptFeaturesItem
      :label='k'
      :value='v'
    />
  </li>
</ul>
</template>
