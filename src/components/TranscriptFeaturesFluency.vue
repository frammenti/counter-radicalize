<script setup lang='ts'>
import { computed } from 'vue'
import TranscriptFeaturesItem from '@/components/TranscriptFeaturesItem.vue'
import { rapid } from '@/stores/state'
import { dummy, type AlignedSegment } from '@/types/segment'
import { capitalize } from '@/utils'

const { data } = defineProps<{ data?: AlignedSegment }>()
const disfluencies = computed(() => {
  if (!data) return
  return Object.fromEntries(
    Object.entries(data.disfluencies).sort((a, b) => (b[1] - a[1]))
  )
})
</script>

<template>
<ul class='feature-list'>
  <li>
    <TranscriptFeaturesItem
      label='Fluency'
      :value='data ? data.fluency : dummy.fluency'
    />
  </li>
  <TransitionGroup
    :name='rapid ? "instant" : "list"'
    :duration='300'
  >
  <li v-for='v, k in disfluencies ?? dummy.disfluencies' :key='k'>
    <span class='label' :class='{ "extra": !v }' :id='k'>{{ capitalize(k) }}</span>
    <span class='value'>{{ ' ●'.repeat(v ?? 0) }}</span>
  </li>
  </TransitionGroup>
</ul>
</template>

<style scoped lang='scss'>
.feature-list li:first-child {
  margin-block-end: 0.2rem;
}
.value {
  vertical-align: text-bottom;
}
.extra {
  opacity: 0.5;
}
</style>
