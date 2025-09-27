<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import { SwitchRoot } from 'reka-ui'
import TranscriptFeaturesItem from '@/components/TranscriptFeaturesItem.vue'
import type { EmotionSegment } from '@/types/segment'

const props = defineProps<{ data: EmotionSegment['emotions'] }>()
const more = shallowRef<boolean>(false)

const THRESHOLD: number = 0.095
const keys = [
  'anger', 'contempt', 'disgust', 'fear', 'happiness',
  'neutral', 'sadness', 'surprise', 'other'
] as const
const shortKeys = [
  'ang.', 'cont.', 'disg.', 'fear', 'happ.',
  'neut.', 'sad.', 'surp.', 'oth.'
] as const

function partition<T>(array: T[], condition: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [], fail: T[] = [];
  array.forEach((e) => (condition(e) ? pass : fail).push(e));
  return [pass, fail];
}

const splitData = computed(() => {
  const items = keys.map((k, i) => [
    k,
    props.data[k],
    shortKeys[i],
  ] as [string, number, string])

  items.sort((a, b) => b[1] - a[1])
  return partition(items, e => e[1] >= THRESHOLD)
})
</script>

<template>
<TransitionGroup
  name='list'
  tag='ul'
  class='feature-list'
  :duration='300'
  appear
>
  <li
    v-for='item in splitData[0]'
    :key='item[0]'
    :class='item[0]'
    class='emotion primary'
  >
    <TranscriptFeaturesItem
      :label='item[0]'
      :value='item[1]'
      :short='item[2]'
    />
  </li>
  <template v-if='more'>
  <li
    v-for='item in splitData[1]'
    :key='item[0]'
    :class='item[0]'
    class='emotion secondary'
  >
    <TranscriptFeaturesItem
      :label='item[0]'
      :value='item[1]'
      :short='item[2]'
    />
  </li>
  </template>
  <li key='see-more'>
    <SwitchRoot
      id='see-more'
      class='button noselect'
      v-model='more'
      aria-label='See more'
    >…</SwitchRoot>
  </li>
</TransitionGroup>
</template>

<style scoped lang='scss'>
@include set-color-legend($emotions);
.emotion:before {
  content: '';
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  border-radius: 5em;
  margin-inline-end: 0.4em;
  vertical-align: middle;
}
.secondary {
  filter: opacity(0.7);
}
#see-more {
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 0;
  color: currentColor;
  background-color: resp($shadow-color);
  padding-inline: 6px;
  padding-block: 2px 14px;
  margin-inline-start: -3px;
  margin-block-start: 2px;
  box-shadow: $box-shadow-small;
}
#see-more:hover,
#see-more[data-state='checked'] {
  background-color: resp((shadow($brown, 0.1), shadow($taupe, 0.2)));
}
#see-more[data-state='checked'] {
  color: resp($text-muted-color);
}
</style>