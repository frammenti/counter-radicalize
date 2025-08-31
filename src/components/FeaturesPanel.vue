<script setup lang='ts'>
import { computed, shallowRef } from 'vue'
import { useWindowSize } from '@vueuse/core'
import Switch from '@/components/Switch.vue'
import EmotionCircle from '@/components/EmotionCircle.vue'
import type { Segment } from '@/types/segment'

const props = defineProps<{ data: Segment | undefined }>()
const show = shallowRef<boolean>(false)
const more = shallowRef<boolean>(false)
const { width, height } = useWindowSize()

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

const splitData = computed<{ 
  primary: [string, number, string][],
  secondary: [string, number, string][]
}>((prev) => {
  if (!props.data) {
    if (!prev) return { primary: [], secondary: [] }
    return prev
  }

  const items = keys.map((key, i) => [
    key,
    props.data?.emotions[key] ?? 0,
    shortKeys[i],
  ] as [string, number, string])

  items.sort((a, b) => b[1] - a[1])
  const [primary, secondary] = partition(items, e => e[1] >= 0.095)

  return { primary, secondary }
})

</script>

<template>
<Switch v-model='show' id='show-features'>Show features</Switch>
<div class='grid'>
  <div class='grid-item-1'>
    <TransitionGroup name='list' tag='ul' v-if='show' :duration='250' appear>
      <li
        v-for='item in splitData.primary'
        :key='item[0]'
        :class='item[0]'
        class='primary'
      >
        <span v-if='width > 768' class='emotion'>{{ item[0] }}</span>
        <span v-else class='emotion' :title='item[0]'>{{ item[2] }}</span>
        <span class='value'>{{ +(item[1] * 100).toFixed(0)  }}<span class='percent'>%</span></span>
      </li>
      <Switch
        id='see-more'
        key='see-more'
        v-model='more'
        v-if='splitData.secondary.length > 0'
      >…</Switch>
      <li
        v-for='item in splitData.secondary'
        :key='item[0]'
        :class='item[0]'
        class='secondary'
        v-if='more'
      >
        <span v-if='width > 768' class='emotion'>{{ item[0] }}</span>
        <span v-else class='emotion' :title='item[0]'>{{ item[2] }}</span>
        <span class='value'>{{ +(item[1] * 100).toFixed(0)  }}<span class='percent'>%</span></span>
      </li>
    </TransitionGroup>
  </div>
  <div class='grid-item-2'>
    <EmotionCircle
      :data='data'
    />
  </div>
  <div class='grid-item-3'>
  </div>
</div>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-columns: 40% 20% 40%;
  grid-template-rows: 100%;
  column-gap: 0.5rem;
  width: 100%;
  height: 100%;
}
.grid-item-1 {
  height: 100%;
  font-size: 0.9em;
}
.grid-item-2 {
  height: 100%;
  align-content: center;
}
ul {
  list-style-type: none;
  padding-inline: 1em;
  padding-block: 0.5em;
  border-radius: 6px;
  width: 10em;
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
}
@include color-legend($emotions);
.percent {
  opacity: 0.7;
}
.value {
  display: inline-block;
  font-size: 0.85em;
}
/* List transitions */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: opacity 150ms cubic-bezier(0.645, 0.045, 0.355, 1),
            transform 250ms cubic-bezier(0.86, 0, 0.07, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}
.list-leave-active {
  position: absolute;
}
.secondary {
  filter: opacity(0.7);
}
/* Buttons */
.input-container:has(#show-features) {
  position: absolute;
  top: -1rem;
  right: 0;
  padding-inline-end: 0.6rem;
  width: fit-content;
  z-index: 2;
}
:deep(#see-more) {
  display: none;
}
:deep(label[for='see-more']) {
  background-color: resp($shadow-color);
  border-radius: 5rem;
  padding-inline: 6px;
  padding-block: 1px 14px;
  cursor: pointer;
  line-height: 0;
  font-size: 1.4rem;
  margin-inline-start: -3px;
  margin-block-start: 2px;
}
:deep(label[for='see-more']:hover) {
  background-color: resp((shadow($brown, 0.1), shadow($taupe, 0.2)));
}
:deep(#see-more[data-state='checked'] + label[for='see-more']) {
  background-color: resp((shadow($brown, 0.1), shadow($taupe, 0.2)));
  color: resp($text-muted-color);
}
@media screen and (max-width: 768px) {
  ul {
    width: 6.6rem;
    padding-inline-end: 0;
    font-size: 0.9em;
    backdrop-filter: blur(30px);
    box-shadow:
      resp((shadow($brown, 0.14), transparent)) 0px 10px 38px -10px,
      resp((shadow($brown, 0.14), transparent)) 0px 10px 20px -15px;
    overflow: hidden;
  }
  .grid {
    grid-template-columns: 100%;
  }
  .grid-item-1 {
    position: absolute;
    top: -1rem;
    left: 0;
    font-size: 0.8em;
    z-index: 2;
  }
}
</style>
