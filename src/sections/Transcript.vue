<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import type { Segment } from '../types/segment'
import segments from '../../models/outputs/segments_emotion.json'
import HlsPlayer from '../components/HlsPlayer.vue'
import SynchText from '../components/SynchText.vue'
import EmotionCircle from '../components/EmotionCircle.vue'
import FeaturesPanel from '../components/FeaturesPanel.vue'

const playtime = shallowRef<number>(0)

// Sync index of active segment
function atMoment(seg: Segment, t: number): boolean {
  let start = seg.start > 0 ? seg.start - 0.01 : 0
  return start < t && t < seg.end
}

const active = computed(() =>
  segments.findIndex(seg => atMoment(seg, playtime.value))
)
</script>

<template>
  <section id='transcript' aria-label='Transcript'>
    <HlsPlayer 
      src='/counter-radicalize/hls/message.m3u8'
      v-model:playtime='playtime'
    />
    <div id='transcript-text' aria-label='Transcript Text'>
      <SynchText
        v-model:playtime='playtime'
        :segments='segments'
        :active='active'
      />
    </div>
    <div id='emotion-circle' class='grid' aria-label='Emotion Circle'>
      <div class='grid-item-1'>
        <EmotionCircle
          :data='segments[active]'
        />
      </div>
      <div class='grid-item-2'>
        <FeaturesPanel
          :data='segments[active]'
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
#transcript {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-around;
  max-width: 56rem;
}
#transcript-text {
  max-height: 50%;
}
#emotion-circle {
  max-height: 30%;
  grid-template-areas: '. circle panel';
  grid-template-columns: 40% 20% 40%;
  grid-template-rows: 100%;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}
.grid-item-1 {
  grid-area: circle;
  height: 100%;
  justify-self: center;
  align-content: center;
}
.grid-item-2 {
  grid-area: panel;
  height: 100%;
  padding-inline-end: 0.5rem;
  justify-self: end;
}
@media screen and (max-width: 768px) {
  #emotion-circle {
    display: flex;
  }
  .grid-item-2 {
    position: absolute;
    top: -1rem;
    left: 0.5rem;
    width: 100%;
    font-size: 0.8em;
  }
  :deep(.emotion) {
    max-width: 2.5em;
  }
}
</style>
