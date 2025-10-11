<script setup lang='ts'>
import { ref, useTemplateRef, defineAsyncComponent, computed } from 'vue'
import TranscriptPlayer from '@/components/TranscriptPlayer.vue'
import TranscriptFeaturesEmotions from '@/components/TranscriptFeaturesEmotions.vue'
import TranscriptFeaturesDimensions from '@/components/TranscriptFeaturesDimensions.vue'
import TranscriptFeaturesFluency from '@/components/TranscriptFeaturesFluency.vue'
import KeyboardShortcut from '@/components/KeyboardShortcut.vue'
import useActiveSegment from '@/composables/useActiveSegment'
import usePlaybackShortcuts from '@/composables/usePlaybackShortcuts'
import type { AlignedSegment } from '@/types/segment'

const Tip = defineAsyncComponent(() => import('@/components/Tip.vue'))
const Toggle = defineAsyncComponent(() => import('@/components/Toggle.vue'))
const TranscriptText = defineAsyncComponent(() => import('@/components/TranscriptText.vue'))
const TranscriptFeaturesCanvas = defineAsyncComponent(() => import('@/components/TranscriptFeaturesCanvas.vue'))

const { segments } = defineProps<{ segments: AlignedSegment[] }>()
const hasKeyboard = window.matchMedia('(pointer: fine)').matches
const section = useTemplateRef('section')
const locked = ref<boolean>(true)
const annotated = ref<boolean>(false)

// Sync index of active segment
const active = useActiveSegment(segments)
const data = computed(() => segments[active.value] )

// Enable shortcuts only when a physical keyboard is available
if (hasKeyboard) {
  usePlaybackShortcuts(segments, active)
}
</script>

<template>
<section id='close-reading' class='paginated' aria-label='Close reading' ref='section' :annotated>
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
  <h2>Close reading</h2>
  <section id='transcript-text' class='p-card' aria-label='Transcript Text'>
    <div class='p-cluster'>
      <TranscriptPlayer 
        src='/counter-radicalize/hls/message.m3u8'
      />
      <fieldset>
      <Toggle
        v-model='annotated'
        text-on='Hide disfluencies'
        text-off='Show disfluencies'
        :style='{ minWidth: "10.7rem" }'
        class='secondary'
      />
      <Toggle
        v-model='locked'
        text-on='Unlock'
        text-off='Lock'
        :style='{ minWidth: "7rem" }'
      />
      </fieldset>
    </div>
    <TranscriptText
      v-model:active='active'
      :segments='segments'
      :locked='locked'
    />
  </section>
  <section id='transcript-features' class='grid cards' aria-label='Transcript Features'>
    <section class='p-card fade' aria-label='Emotion Circle'>
      <TranscriptFeaturesCanvas :data='data' />
    </section>
    <aside class='p-card no-contain' aria-labelledby='emotions'>
      <h3 id='emotions'>Emotions</h3>
      <TranscriptFeaturesEmotions :data='data' />
    </aside>
    <aside class='p-card no-contain' aria-labelledby='dimensions'>
      <h3 id='dimensions'>Dimensions</h3>
      <TranscriptFeaturesDimensions :data='data' />
    </aside>
    <aside class='p-card no-contain' aria-labelledby='speech-flow'>
      <h3 id='speech-flow'>Speech flow</h3>
      <TranscriptFeaturesFluency :data='data' />
    </aside>
  </section>
</section>
</template>

<style scoped lang='scss'>
$transcript-height: calc(15lh + $card-padding * 2 + 60px);
$transcript-height-mobile: calc(15lh + $card-padding * 2 + 60px + $fs-base * 1.5 + $button-padding-block * 2 + $cluster-gap * 2);

#transcript-text {
  height: $transcript-height;
  display: flex;
  flex-direction: column;
}
:deep(#transcript-container) {
  padding-inline: 22cqi;
  margin-block-end: $card-padding;
}
aside ul {
  padding-inline-start: 0;
  list-style-type: none;
}
.grid.cards {
  grid-template-columns: 43cqi 1fr 1fr;
  grid-template-rows: auto auto;

  > :first-child,
  > :nth-child(2) {
    grid-row: span 2;
  }

  > :first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    
    canvas {
      aspect-ratio: 1 / 1;
    }
  }

  h3 {
    font-size: $fs-s;
  }
}

@media screen and (width > 1440px) {
  .grid.cards {
    grid-template-columns: 52cqi 1fr 1fr;
    }
}

@media screen and (width < $laptop) {
  :deep(#transcript-container) {
    padding-inline: 0;
  }

  .grid.cards {
    grid-template-columns: 1.1fr 1fr;
    grid-template-rows: 70cqi auto auto;

    > :first-child {
      grid-row: span 1;
      grid-column: span 2;
    }
  }
}

@media screen and (width < $tablet) {
  #transcript-text {
    height: $transcript-height-mobile;
  }
  .grid.cards {
    grid-template-columns: 100%;
    grid-template-rows: 100cqi auto auto auto;

    > :first-child,
    > :nth-child(2) {
      grid-row: span 1;
      grid-column: span 1;
    }
  }
}

/* Transitions */
:deep(.list-enter-active),
:deep(.list-leave-active) {
  transition: opacity 150ms cubic-bezier(0.7, 0.9, 1, 1);
}
:deep(.list-move) {
  transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1);
}
:deep(.list-enter-from),
:deep(.list-leave-to) {
  opacity: 0;
}
:deep(.list-leave-active) {
  position: absolute;
}

:deep(.instant-move),
:deep(.instant-enter-from),
:deep(.instant-leave-to) {
  display: none;
}

// Disfluencies
[annotated="true"] {
  :deep(.sound.repetition) {
    text-decoration: underline dashed 1px;
    @include theme(text-decoration-color, secondary);
  }
  :deep(.block):before {
    content: " ‖ ";
    font-variation-settings: 'wght' 600;
    font-style: normal;
    text-decoration: none;
    @include theme(color, secondary);
  }
  :deep(.word.repetition):after {
    content: " x2";
    font-variation-settings: 'wght' 600;
    font-variant: small-caps;
    font-size: 50%;
    vertical-align: top;
    text-decoration: none;
    @include theme(color, secondary);
  }
  :deep(.word.repetition):has(+ .word.repetition):after,
  :deep(.word.repetition):has(+ div + .word.repetition):after
  {
    content: ""
  }
  :deep(.interjection) {
    @include text-italic();
    @include theme(color, secondary);
  }
  :deep(.prolongation):after {
    content: ":::";
    font-variation-settings: 'wght' 400;
    font-style: normal;
    text-decoration: none;
    font-size: 100%;
    vertical-align: auto;
    @include theme(color, secondary);
  }
  :deep(.active) .sound.repetition {
    @include theme-mix(text-decoration-color, link, secondary);
  }
  :deep(.active) .interjection,
  :deep(.active) .block:before,
  :deep(.active) .prolongation:after,
  :deep(.active) .word.repetition:after {
    @include theme-mix(color, link, secondary);
  }

  // Legend
  :deep([id='sound repetition']) {
    text-decoration: underline dashed 1px;
  }
  :deep(#block:after) {
    content: " ‖";
    font-variation-settings: 'wght' 600;
  }
  :deep([id='word repetition']:after) {
    content: " x2";
    font-variation-settings: 'wght' 600;
    font-variant: small-caps;
    font-size: 50%;
    vertical-align: top;
  }
  :deep(#interjection) {
    @include text-italic();
  }
  :deep(#prolongation:after) {
    content: ":::";
    font-variation-settings: 'wght' 400;
  }
}
</style>
