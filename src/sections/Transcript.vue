<script setup lang='ts'>
import { ref, computed } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptText from '@/components/TranscriptText.vue'
import TranscriptFeatures from '@/components/TranscriptFeatures.vue'
import segments from '@models/outputs/segments_emotion.json'
import type { Segment } from '@/types/segment'
import usePlaybackShortcuts from '@/composables/usePlaybackShortcuts'

const playtime = ref<number>(0)
const playing = ref<boolean>(false)

// Sync index of active segment
function atMoment(seg: Segment, t: number): boolean {
  let start = t > 0 ? seg.start - 0.1 : 0
  return start < t && t < seg.end
}

const active = computed(() =>
  segments.findIndex(seg => atMoment(seg, playtime.value))
)
if (window.matchMedia('(any-pointer: fine)').matches) {
  usePlaybackShortcuts(playtime, playing, segments, active)
}
</script>

<template>
<section id='transcript' class='paginated' aria-label='Transcript'>
  <TranscriptPlayer 
    src='/counter-radicalize/hls/message.m3u8'
    v-model:playtime='playtime'
    v-model:playing='playing'
  />
  <section id='transcript-text' aria-label='Transcript Text'>
    <TranscriptText
      v-model:playtime='playtime'
      :segments='segments'
      :active='active'
    />
  </section>
  <section id='transcript-features' aria-label='Transcript Features'>
    <TranscriptFeatures
      :data='segments[active]'
    />
  </section>
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
#transcript-features {
  position: relative;
  max-height: 30%;
  width: 100%;
}
</style>
