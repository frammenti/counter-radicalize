<script setup lang='ts'>
import TranscriptItem from '@/components/TranscriptItem.vue'
import { dummy, type AlignedSegment } from '@/types/segment'

defineProps<{ data?: AlignedSegment }>()
</script>

<template>
<ul class='feature-list'>
  <li v-for='v, k in data ? data.dimensions : dummy.dimensions' :key='k'>
    <TranscriptItem
      :label='k'
      :value='v'
    />
  </li>
</ul>
</template>
