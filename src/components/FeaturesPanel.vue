<script setup lang='ts'>
import { computed, ref } from 'vue'
import Switch from '@/components/Switch.vue'
import type { Segment } from '@/types/segment'

const props = defineProps<{ data: Segment | undefined }>()
const show = ref<boolean>(false)
const keys = [
  'anger', 'contempt', 'disgust', 'fear', 'happiness',
  'neutral', 'sadness', 'surprise', 'other'
] as const

const sortedData = computed(() => {
  if (!props.data) return
  const items = keys.map(key => [key, props.data?.emotions[key] ?? 0] as [string, number]);
  return items.sort((first, second) => second[1] - first[1])
})
</script>

<template>
<div class='panel'>
  <Switch v-model='show' id='show-features'>Show features</Switch>
  <ul v-if='show'>
  <li
    v-for='(tup, i) in sortedData'
    :key='i'
    :class='tup[0]'
  >
    <span class='emotion'>{{ tup[0] }}</span>
    <span class='value'>{{ +(tup[1] * 100).toFixed(0)  }}<span class='percent'>%</span></span>
  </li>
  </ul>
</div>
</template>

<style scoped lang='scss'>
.panel {
  display: flex;
  flex-flow: column;
  align-items: start;
  justify-items: left;
  width: 100%;
  height: 100%;
  font-size: 0.9em;
}
ul {
  list-style-type: none;
  padding-inline: 1em;
  padding-block: 0.5em;
  border-radius: 6px;
  backdrop-filter: blur(50px);
}
li {
  display: flex;
  flex-flow: row;
  align-items: center;
}
li:before {
  content: '';
  display: inline-block;
  width: 0.8em;
  height: 0.8em;
  border-radius: 5em;
  margin-inline-end: 0.4em;
}
.emotion {
  display: inline-block;
  font-weight: 500;
  margin-inline-end: 0.4em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: '.';
}
.percent {
  opacity: 0.7;
}
@include color-legend($emotions);
.value {
  display: inline-block;
  font-size: 0.85em;
  align-self: last baseline;
}
</style>
