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
const Tooltip = defineAsyncComponent(() => import('@/components/Tooltip.vue'))
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
    <div class='shortcuts'>
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
    </div>
    <p>Press and hold to quickly scan through segments.</p>
  </Tip>
  <h2>Close reading</h2>
  <section id='transcript-text' class='p-card' aria-label='Transcript Text'>
    <div class='p-cluster'>
      <TranscriptPlayer 
        src='/counter-radicalize/hls/message.m3u8'
      />
      <fieldset
        aria-label='Text controls'
      >
      <legend>Control annotation visibility and the ability to scroll the transcript.</legend>
      <Toggle
        v-model='annotated'
        title='disfluency annotations'
        text-on='Hide disfluencies'
        text-off='Show disfluencies'
        :style='{ minWidth: "10.7rem" }'
        class='button-secondary'
      />
      <Toggle
        v-model='locked'
        title='text scroll'
        text-on='Unlock'
        text-off='Lock'
        :style='{ minWidth: "7rem" }'
        class='button-primary'
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
    <aside class='p-card no-contain' aria-labelledby='speech-flow' style='position: relative;'>
      <h3 id='speech-flow'>
        Speech flow
        <Tooltip>
          ⓘ
          <template #content>
            <p>
              Disfluencies that overlap segments are not displayed in the text, but are still counted.
            </p>
          </template>
        </Tooltip>
      </h3>
      <TranscriptFeaturesFluency :data='data' />
    </aside>
  </section>
</section>
</template>

<style scoped lang='scss'>
$transcript-height: calc(60px + $cluster-gap + 15.5lh + var(--card-padding) * 3);
$transcript-height-mobile: calc(60px + $fs-base * 1.5 + $button-padding-block * 2 + $cluster-gap * 2 + 15.5lh + var(--card-padding) * 3);

legend { opacity: 0; position: absolute; pointer-events: none; }

:deep(#speech-flow) span {
  font-family: $font-family-symbol;
  font-size: $fs-m;
  font-variation-settings: normal;
  font-weight: 700;
  line-height: 0;
  padding-inline: 0.15rem;
  opacity: 0.9;
  cursor: default;
  user-select: none;
}

.shortcuts {
  gap: $space-s-m;
  display: flex;
  align-items: start;
  justify-content: space-between;
  text-align: center;
  width: 100%;
  margin-block-end: $space-2xs;
}

#transcript-text {
  height: $transcript-height-mobile;
  display: flex;
  flex-direction: column;
  font-size: $fs-m;
  line-height: 1.7;

  #transcript-container {
    margin-block-end: var(--card-padding);
  }
}
aside ul {
  padding-inline-start: 0;
  list-style-type: none;
}
.grid.cards {
  grid-template-columns: 100%;
  grid-template-rows: 100cqi auto auto auto;

  > :first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    
    canvas {
      aspect-ratio: 1 / 1;
    }
  }
}

@media screen and (width >= $tablet) {
  #transcript-text {
    height: $transcript-height;
  }
  .grid.cards {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 70cqi auto auto;

    > :first-child {
      grid-column: span 2;
    }

    > :nth-child(2) {
      grid-row: span 2;
    }
  }
}

@media screen and (width >= $laptop) {
  :deep(#transcript-body) {
    max-width: 42rem;
    margin: auto;
  }
  .grid.cards {
    grid-template-columns: 43cqi 1fr 1.2fr;
    grid-template-rows: auto auto;

    > :first-child,
    > :nth-child(2) {
      grid-column: span 1;
      grid-row: span 2;
    }
  }
}

@media screen and (width >= $desktop) {
  .grid.cards {
    grid-template-columns: 50cqi 1fr 1.1fr;
  }
}
</style>
