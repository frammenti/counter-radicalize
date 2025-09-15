<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptText from '@/components/TranscriptText.vue'
import TranscriptFeatures from '@/components/TranscriptFeatures.vue'
import KeyboardShortcutsTip from '@/components/KeyboardShortcutsTip.vue'
import segments from '@models/outputs/segments_emotion.json'
import type { EmotionSegment } from '@/types/emotion-segment'
import usePlaybackShortcuts from '@/composables/usePlaybackShortcuts'

const playtime = shallowRef<number>(0)
const playing = shallowRef<boolean>(false)
const hasKeyboard: boolean = window.matchMedia('(any-pointer: fine)').matches
const section = shallowRef<HTMLElement | null>(null)

// Sync index of active segment
function atMoment(seg: EmotionSegment, t: number): boolean {
  let start = t > 0 ? seg.start - 0.1 : 0
  return start < t && t < seg.end
}
const active = computed(() =>
  segments.findIndex(seg => atMoment(seg, playtime.value))
)

// Enable shortcuts only when a phisical keyboard is available
if (hasKeyboard) {
  usePlaybackShortcuts(playtime, playing, segments, active)
}
</script>

<template>
<section id='transcript' class='paginated' aria-label='Transcript' ref='section'>
  <KeyboardShortcutsTip v-if='hasKeyboard' :anchor='section' />
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

<style scoped lang='scss'>
#transcript {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-around;
  max-width: 56rem;
  position: relative;
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
