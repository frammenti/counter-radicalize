<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import type { Segment } from '../types/segment'
import segments from '../../models/outputs/segments_emotion.json'
import HlsPlayer from './HlsPlayer.vue'
import TranscriptText from './TranscriptText.vue'
import EmotionCircle from './EmotionCircle.vue'

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
      <TranscriptText
        v-model:playtime='playtime'
        :segments='segments'
        :active='active'
      />
    </div>
    <div id='emotion-circle' aria-label='Emotion Circle'>
      <EmotionCircle
        :data='segments[active]'
      />
    </div>
  </section>
</template>

<style scoped>
#transcript {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-around;
}
#transcript-text {
  max-height: 50%;
}
#emotion-circle {
  height: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
