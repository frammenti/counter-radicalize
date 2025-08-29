<script setup lang='ts'>
import { ref } from 'vue'
import Switch from './Switch.vue'
import type { Segment } from '../types/segment'

const props = defineProps<{ data: Segment | undefined }>()
const show = ref<boolean>(false)
</script>

<template>
<div class='panel'>
  <Switch v-model='show' id='show-features'>Show features</Switch>
  <ul v-if='show'>
  <li
    v-for='(val, emotion) in props.data?.emotions'
    :class='emotion'
  >
    <span class='emotion'>{{ emotion }}</span>
    <span class='value'>{{ +(val * 100).toFixed(2)  }}%</span>
  </li>
  </ul>
</div>
</template>

<style scoped lang='scss'>
@use '../assets/styles/palette' as *;

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
  padding: 0;
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
@include emotion-classes-legend($emotions);
.value {
  display: inline-block;
  font-size: 0.85em;
  align-self: last baseline;
}
</style>
