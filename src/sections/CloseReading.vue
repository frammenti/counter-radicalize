<script setup lang='ts'>
import { ref, useTemplateRef } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptText from '@/components/TranscriptText.vue'
import TranscriptFeatures from '@/components/TranscriptFeatures.vue'
import KeyboardShortcut from '@/components/KeyboardShortcut.vue'
import Tip from '@/components/Tip.vue'
import useActiveSegment from '@/composables/useActiveSegment'
import usePlaybackShortcuts from '@/composables/usePlaybackShortcuts'
import type { AlignedSegment } from '@/types/segment'

const props = defineProps<{ segments: AlignedSegment[] }>()
const hasKeyboard = window.matchMedia('(pointer: fine)').matches
const section = useTemplateRef('section')
const locked = ref<boolean>(true)
const annotated = ref<boolean>(false)

// Sync index of active segment
const active = useActiveSegment(props.segments)

// Enable shortcuts only when a physical keyboard is available
if (hasKeyboard) {
  usePlaybackShortcuts(props.segments, active)
}
</script>

<template>
<section id='close-reading' class='paginated' aria-label='Close reading' ref='section'>
  <Tip v-if='hasKeyboard' :anchor='section' title='Keyboard shortcuts'>
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
  />
  <section id='transcript-text' aria-label='Transcript Text'>
    <TranscriptText
      v-model:active='active'
      :segments='segments'
      :locked='locked'
      :annotated='annotated'
    />
  </section>
  <section id='transcript-features' aria-label='Transcript Features'>
    <TranscriptFeatures
      :data='segments[active]'
      v-model:annotated='annotated'
      v-model:locked='locked'
    />
  </section>
</section>
</template>

<style scoped lang='scss'>
#close-reading {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  max-width: 56rem;
}
#transcript-text {
  max-height: 46%;
  width: 100%;
  flex: 0 2;
}
#transcript-features {
  position: relative;
  max-height: 34%;
  width: 100%;
}
@media screen and (width < $tablet) {
  #close-reading {
    padding-block-start: 4rem;
    height: calc(100lvh - $section-spacing-mobile);
  }
}
</style>
