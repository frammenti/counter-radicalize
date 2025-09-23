<script setup lang='ts'>
import { shallowRef, computed, useTemplateRef } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptText from '@/components/TranscriptText.vue'
import TranscriptFeatures from '@/components/TranscriptFeatures.vue'
import KeyboardShortcut from '@/components/KeyboardShortcut.vue'
import Tip from '@/components/Tip.vue'
import { playtime } from '@/stores/playtime'
import segments from '@/stores/segments.json'
import type { EmotionSegment } from '@/types/emotion-segment'
import usePlaybackShortcuts from '@/composables/usePlaybackShortcuts'

const playing = shallowRef<boolean>(false)
const hasKeyboard: boolean = window.matchMedia('(any-pointer: fine)').matches
const section = useTemplateRef('section')
const annotated = shallowRef<boolean>(false)

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
<section id='close-reading' class='paginated' aria-label='Close reading' ref='section'>
  <Tip :anchor='section' title='Keyboard shortcuts'>
    <KeyboardShortcut
      modifier='meta'
      :keys='["ArrowLeft"]'
      id='shortcut-prev'
    >prev segment</KeyboardShortcut>
    <KeyboardShortcut
      modifier='meta'
      :keys='["space"]'
      id='shortcut-play'
    >play/pause</KeyboardShortcut>
    <KeyboardShortcut
      modifier='meta'
      :keys='["ArrowRight"]'
      id='shortcut-next'
    >next segment</KeyboardShortcut>
  </Tip>
  <TranscriptPlayer 
    src='/counter-radicalize/hls/message.m3u8'
    v-model:playing='playing'
  />
  <section id='transcript-text' aria-label='Transcript Text'>
    <TranscriptText
      :segments='segments'
      :active='active'
      :annotated='annotated'
    />
  </section>
  <section id='transcript-features' aria-label='Transcript Features'>
    <TranscriptFeatures
      :data='segments[active]'
      v-model:annotated='annotated'
    />
  </section>
</section>
</template>

<style scoped lang='scss'>
#close-reading {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  max-width: 56rem;
  position: relative;
}
#transcript-text {
  max-height: 46%;
  width: 100%;
}
#transcript-features {
  position: relative;
  max-height: 35%;
  width: 100%;
}
@media screen and (max-width: 768px) {
  #close-reading {
    padding-block-start: 6rem;
  }
}
</style>
