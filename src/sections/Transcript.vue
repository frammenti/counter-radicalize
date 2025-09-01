<script setup lang='ts'>
import { ref, computed } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptText from '@/components/TranscriptText.vue'
import TranscriptFeatures from '@/components/TranscriptFeatures.vue'
import segments from '@models/outputs/segments_emotion.json'
import type { Segment } from '@/types/segment'

const playtime = ref<number>(0)

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
    <TranscriptPlayer 
      src='/counter-radicalize/hls/message.m3u8'
      v-model:playtime='playtime'
      v-model:playing='playing'
    />
    <div id='transcript-text' aria-label='Transcript Text'>
      <TranscriptText
        v-model:playtime='playtime'
        :segments='segments'
        :active='active'
      />
    </div>
    <div id='emotion-circle' aria-label='Emotion Circle'>
      <TranscriptFeatures
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
