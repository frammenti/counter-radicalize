<script setup lang='ts'>
import { ref, reactive, watch } from 'vue'
import SegmentButton from '@/components/SegmentButton.vue'
import { active } from '@/composables/useActiveSegment'
import { playtime, playing } from '@/stores/state'
import { capitalize } from '@/utils'
import ranking from '@/stores/ranking.json'
import type { AlignedSegment, RankedSegment, Stats } from '@/types/segment'


const { facet, subfacet } = defineProps<{
  facet: keyof Stats,
  subfacet: keyof Stats['emotions'] | keyof Stats['fluency']
}>()

type State = 'start' | 'end' | 'resume' | 'cancel'

const activeSeg = ref<RankedSegment>()

const states: Record<number, State> = reactive(
  Object.fromEntries(
    Array.from(getIndexes(ranking), (idx: number) => [idx, 'cancel'])
  )
)

function getIndexes(obj: object, set: Set<number> = new Set()): Set<number> {
  if (obj && typeof obj === 'object') {
    if ('index' in obj && typeof obj.index === 'number') {
      set.add(obj.index)
    }
    for (const value of Object.values(obj)) {
      getIndexes(value, set)
    }
  }
  return set
}

function setState(index: number, value: State) {
  states[index] = value
}

function setActive(seg: RankedSegment) {
  if (activeSeg.value && activeSeg.value.index !== seg.index) {
    setState(activeSeg.value.index, 'cancel')
  }
  activeSeg.value = seg
  active.value = seg.index
  playtime.value = seg.start
  playing.value = true
  setState(seg.index, 'start')
}

watch([playtime, playing], ([t, p]) => {
  const seg = activeSeg.value
  if (!seg) return
  if (!p) setState(seg.index, 'end')
  else if (t >= seg.end) {
    setState(seg.index, 'end')
    playing.value = false
    activeSeg.value = undefined
    requestAnimationFrame(() => setState(seg.index, 'cancel'))
  } else if (t > seg.start && states[seg.index] !== 'resume') {
    setState(seg.index, 'resume')
  }
})
</script>

<template>
<div
  class='p-card ranking'
  v-for='rank in ["top", "bottom"] as const'
  :key='rank'
>
  <template v-if='facet === "emotions"'>
  <h4>{{ capitalize(rank) }} 3 segments for {{
    subfacet === 'neutral'
      ? 'neutral emotion'
      : subfacet === 'other'
        ? 'other emotions'
        : subfacet
  }}</h4>
  <ol>
    <li
      v-for='seg, i in ranking[facet][subfacet as keyof AlignedSegment["emotions"]][rank]'
      :key='i'
    >
      <SegmentButton
        :seg='seg'
        :state='states[seg.index]'
        @click.passive='setActive(seg)'
        @keydown.enter.passive='setActive(seg)'
      />
    </li>
  </ol>
  </template>
  <template v-else>
  <h4>{{ capitalize(rank) }} 3 segments for {{ facet }}</h4>
  <ol>
    <li
      v-for='seg, i in ranking[facet][rank]'
      :key='i'
    >
      <SegmentButton
        :seg='seg'
        :state='states[seg.index]'
        @click.passive='setActive(seg)'
        @keydown.enter.passive='setActive(seg)'
      />
    </li>
  </ol>
  </template>
</div>
</template>

<style scoped lang='scss'>
.ranking {
  font-size: $fs-s;

  h4 {
    font-variation-settings: 'wght' 550, 'wdth' 115;
    margin-block-end: 0.5rem;
  }
  ol {
    margin-block: 0;
    padding-inline-start: 0.25rem;
    list-style-position: inside;
    font-variation-settings: 'wght' 500;
    @include theme(color, link);

    li {
      width: 100%;
    }
  }
}

@media screen and (width >= $tablet) {
  .ranking {
    font-size: $fs-base;

    ol {
      padding-inline-start: 0;

      li {
        max-width: 900px;
        margin-inline: auto;
      }
    }
  }
}
</style>
