<script setup lang='ts'>
import { ref, reactive, computed, watch } from 'vue'
import { RovingFocusGroup, RovingFocusItem } from 'reka-ui'
import SegmentButton from '@/components/SegmentButton.vue'
import { active } from '@/composables/useActiveSegment'
import { playtime, playing } from '@/stores/state'
import { round, capitalize } from '@/utils'
import ranking from '@/stores/ranking.json'
import type { RankedSegment, Stats } from '@/types/segment'


const { facet, subfacet = 'neutral' } = defineProps<{
  facet: keyof Stats,
  subfacet?: EmotionKey | string
}>()

// Data
const ranks = ['top', 'bottom'] as const
type Rank = typeof ranks[number]
type Ranking = Record<Rank, RankedSegment[]>

type EmotionKey = keyof Stats['emotions']

type RankingData = {
  emotions: Record<EmotionKey, Ranking>
} & Record<Exclude<keyof Stats, 'emotions'>, Ranking>

const typedRanking = ranking as RankingData

function isEmotion(facet: keyof Stats): facet is 'emotions' {
  return facet === 'emotions'
}

const data = computed(() => {
  if (isEmotion(facet)) {
    return typedRanking.emotions[subfacet as EmotionKey]
  }
  return typedRanking[facet]
})

// State
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
    setTimeout(() => setState(seg.index, 'cancel'), 200)
  } else if (t > seg.start && states[seg.index] !== 'resume') {
    setState(seg.index, 'resume')
  }
})
</script>

<template>
<div
  class='p-card ranking'
  v-for='rank in ranks'
  :key='rank'
  role='region'
  :aria-label='`${capitalize(rank)} 3 segments for ${isEmotion(facet) ? subfacet : facet}`'
>
  <hgroup>
    <h3>{{ capitalize(rank) }} 3</h3>
    <p>
       {{ capitalize(isEmotion(facet) ? subfacet : facet) }}
    </p>
  </hgroup>
  <RovingFocusGroup
    orientation='vertical'
    :prevent-scroll-on-entry-focus='true'
    loop
    as='ol'
  >
    <li
      v-for='seg, i in data[rank]'
      :key='i'
    >
      <RovingFocusItem
        :id='`${rank}-${i + 1}-${isEmotion(facet) ? subfacet : facet}`'
        :tab-stop-id='`${i + 1}`'
        as-child
      >
        <SegmentButton
          :seg='seg'
          :state='states[seg.index]'
          @click.passive='setActive(seg)'
          @keydown.enter.passive='setActive(seg)'
          aria-controls='audio-player'
        />
      </RovingFocusItem>
      <span class='percentage'>&nbsp;{{ round(seg.value, 100, 0) }}%</span>
    </li>
  </RovingFocusGroup>
</div>
</template>

<style lang='scss'>
.ranking {
  font-size: $fs-s;
  pointer-events: all;

  hgroup {
    margin-block-end: $space-s;

    h3 {
      margin-block: 0;
      display: inline;
      font-size: $fs-base;
    }

    p {
      display: inline;
      margin-block: 0;
      font-size: $fs-m;

      &:before {
        content: ' • ';
        font-variation-settings: 'wght' 900;
      }
    }
  }

  ol {
    margin-block: 0;
    padding-inline-start: 0;
    list-style-type: none;
    font-variation-settings: 'wght' 500;
    @include theme(color, primary-text);

    li {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: $space-2xs;
      margin-block-end: $space-xs;

      &:before {
        user-select: text;
        flex: 1 0;
        font-variation-settings: 'wght' 600;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.4lh;
        max-width: 1.4lh;
        border-radius: $radius-max;
        @include theme(color, text, true);
        @include theme(background-color, background, true);
      }

      &:first-child:before { content: '1'; }
      &:nth-child(2):before { content: '2'; }
      &:nth-child(3):before { content: '3'; }

      .button {
        flex: 1;
      }

      .percentage {
        display: none;
        font-size: $fs-s;
        font-variation-settings: 'wght' 300;
        @include theme(color, text);
      }

      &:hover { .percentage { display: inline; } }
    }
  }
}

@media screen and (width >= $tablet) {
  .ranking {
    font-size: $fs-base;

    hgroup {
      h3 { font-size: $fs-m; }
      p { font-size: $fs-l; }
    }

    ol {
      padding-inline-start: 0;

      li {
        max-width: 900px;
        margin-inline: auto;

        .percentage { display: inline; }
      }
    }
  }
}
</style>
