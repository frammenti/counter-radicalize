<script setup lang='ts'>
import { computed } from 'vue'
import TranscriptFeaturesItem from '@/components/TranscriptFeaturesItem.vue'
import usePartition from '@/composables/usePartition'
import { rapid } from '@/stores/state'
import { dummy, type AlignedSegment } from '@/types/segment'

const { data } = defineProps<{ data?: AlignedSegment }>()

const splitData = computed(() => data ? usePartition(data.emotions) : undefined)
</script>

<template>
<TransitionGroup
  :name='rapid ? "instant" : "list"'
  tag='ul'
  class='feature-list'
  :duration='300'
>
  <template v-if='splitData'>
    <li
      v-for='item in splitData[0]'
      :key='item[0]'
      :class='item[0]'
      class='emotion'
    >
      <TranscriptFeaturesItem
        :label='item[0]'
        :value='item[1]'
      />
    </li>
    <li><hr /></li>
    <li
      v-for='item in splitData[1]'
      :key='item[0]'
      :class='item[0]'
      class='emotion extra'
    >
      <TranscriptFeaturesItem
        :label='item[0]'
        :value='item[1]'
      />
    </li>
  </template>
  <template v-else>
    <li
      v-for='v, k in dummy.emotions'
      :key='k'
      :class='k'
      class='emotion'
    >
      <TranscriptFeaturesItem :label='k' :value='v' />
    </li>
    <li style='visibility: hidden;'><hr /></li>
  </template>
</TransitionGroup>
</template>

<style scoped lang='scss'>
@include set-color-legend($emotions);
.emotion:before {
  content: '';
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  border-radius: $radius-max;
  margin-inline-end: 0.5em;
  vertical-align: text-top;
}
.extra {
  opacity: 0.7;
}
hr {
  margin-inline-start: 0;
  width: max(13rem, 65%);
}
</style>
