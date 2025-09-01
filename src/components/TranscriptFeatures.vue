<script setup lang='ts'>
import { computed, shallowRef } from 'vue'
import { useWindowSize } from '@vueuse/core'
import Switch from '@/components/Switch.vue'
import TranscriptFeaturesCanvas from '@/components/TranscriptFeaturesCanvas.vue'
import type { Segment } from '@/types/segment'

const props = defineProps<{ data: Segment | undefined }>()
const show = shallowRef<boolean>(false)
const more = shallowRef<boolean>(false)
const { width } = useWindowSize()

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

const dimensions = computed<{
  arousal: number;
  valence: number;
  dominance: number;
} | undefined>((prev) => {
  if (!props.data) {
    if (!prev) return
    return prev
  }
  return props.data.dimensions
})

</script>

<template>
<Switch v-model='show' id='show-features'>Show features</Switch>
<div class='grid'>
  <div class='grid-item-1'>
    <TransitionGroup name='list' tag='ul' v-if='show && splitData.primary.length > 0' :duration='300' appear>
      <h4 key='title'>Emotions</h4>
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
      <template v-if='more'>
      <li
        v-for='item in splitData.secondary'
        :key='item[0]'
        :class='item[0]'
        class='secondary'
      >
        <span v-if='width > 768' class='emotion'>{{ item[0] }}</span>
        <span v-else class='emotion' :title='item[0]'>{{ item[2] }}</span>
        <span class='value'>{{ +(item[1] * 100).toFixed(0)  }}<span class='percent'>%</span></span>
      </li>
      </template>
      <Switch
        key='see-more'
        id='see-more'
        class='noselect'
        v-model='more'
      >…</Switch>
    </TransitionGroup>
  </div>
  <div class='grid-item-2'>
    <TranscriptFeaturesCanvas
      :data='data'
    />
  </div>
  <div class='grid-item-3'>
    <Transition name='list' v-if='show && dimensions' appear>
      <ul>
        <h4>Dimensions</h4>
        <li>
          <span v-if='dimensions.valence < 0.25' style='filter: grayscale(1);'>🙁</span>
          <span v-else-if='dimensions.valence < 0.5' style='filter: grayscale(0.75);'>😐</span>
          <span v-else-if='dimensions.valence < 0.75' style='filter: grayscale(0.25);'>🙂</span>
          <span v-else>😁</span>
          <span v-if='width > 768' class='emotion'>valence</span>
          <span v-else class='emotion' title='valence'>val.</span>
          <span class='value'>{{ +(dimensions.valence * 100).toFixed(0)  }}<span class='percent'>%</span></span>
        </li>
        <li>
          <span :style='{ fontSize: dimensions.arousal + 0.3 + "em" }'>🔥</span>
          <span v-if='width > 768' class='emotion'>arousal</span>
          <span v-else class='emotion' title='arousal'>aro.</span>
          <span class='value'>{{ +(dimensions.arousal * 100).toFixed(0)  }}<span class='percent'>%</span></span>
        </li>
        <li>
          <span v-if='dimensions.dominance < 0.25'>🐭</span>
          <span v-else-if='dimensions.dominance < 0.5'>🐶</span>
          <span v-else-if='dimensions.dominance < 0.75'>🐻</span>
          <span v-else>🦁</span>
          <span v-if='width > 768' class='emotion'>dominance</span>
          <span v-else class='emotion' title='dominance'>dom.</span>
          <span class='value'>{{ +(dimensions.dominance * 100).toFixed(0)  }}<span class='percent'>%</span></span>
        </li>
      </ul>
    </Transition>
  </div>
</div>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-columns: 35% 26% 35%;
  grid-template-rows: 100%;
  column-gap: 2%;
  width: 100%;
  height: 100%;
}
.grid-item-1, .grid-item-3 {
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
  overflow: hidden;
}
.grid-item-1 ul {
  width: 10em;
}
.grid-item-3 ul {
  width: 11.5em;
}
h4 {
  margin-block: 0 0.2em;
}
li {
  display: flex;
  flex-flow: row;
  align-items: center;
}
.grid-item-1 li:before {
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
@include set-color-legend($emotions);
.percent {
  opacity: 0.7;
}
.value {
  display: inline-block;
  font-size: 0.85em;
}
.grid-item-3 li > span:first-child {
  display: inline-flex;
  width: 1.1rem;
  align-items: center;
  justify-content: center;
  margin-inline-end: 0.25rem;
  contain: size;
}
/* List transitions */
.list-enter-active,
.list-leave-active {
  transition: opacity 150ms cubic-bezier(0.7, 0.9, 1, 1);
}
.list-move {
  transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1);
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
#emotion-circle > .input-container {
  position: absolute;
  top: -1.4em;
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
    padding-inline-end: 0;
    font-size: 0.9em;
    backdrop-filter: blur(30px);
    box-shadow:
      resp((shadow($brown, 0.14), transparent)) 0px 10px 38px -10px,
      resp((shadow($brown, 0.14), transparent)) 0px 10px 20px -15px;
  }
  .grid-item-1 ul {
    width: 6.6rem;
  }
  .grid-item-3 ul {
    width: 6.8rem;
  }
  .grid-item-3 li > span:first-child {
    width: 1rem;
  }
  .grid {
    grid-template-columns: 100%;
  }
  .grid-item-1, .grid-item-3 {
    position: absolute;
    top: 0;
    font-size: 0.8em;
    z-index: 2;
  }
  .grid-item-1 {
    left: 0;
  }
  .grid-item-3 {
    right: 0;
  }
}
</style>
