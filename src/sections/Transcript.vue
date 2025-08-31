<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import SynchText from '@/components/SynchText.vue'
import FeaturesPanel from '@/components/FeaturesPanel.vue'
import segments from '@models/outputs/segments_emotion.json'
import type { Segment } from '@/types/segment'

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
    <div id='emotion-circle' aria-label='Emotion Circle'>
      <FeaturesPanel
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
  max-width: 56rem;
}
#transcript-text {
  max-height: 50%;
  width: 100%;
}
#emotion-circle {
  position: relative;
  max-height: 30%;
  width: 100%;
}
</style>
