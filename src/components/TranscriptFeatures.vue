<script setup lang='ts'>
import { computed, shallowRef } from 'vue'
import Switch from '@/components/Switch.vue'
import TranscriptFeaturesCanvas from '@/components/TranscriptFeaturesCanvas.vue'
import TranscriptFeaturesEmotions from '@/components/TranscriptFeaturesEmotions.vue'
import TranscriptFeaturesDimensions from '@/components/TranscriptFeaturesDimensions.vue'
import type { EmotionSegment } from '@/types/emotion-segment'

const props = defineProps<{ data: EmotionSegment | undefined }>()
const annotated = defineModel('annotated', { type: Boolean, required: true })
const show = shallowRef<boolean>(false)

// Keep the previous data in between segments
const permaData = computed<EmotionSegment | undefined>((prev) => {
  if (!props.data) return prev
  return props.data
})
</script>

<template>
<div class='grid'>
  <div class='switch-group'>
    <Switch v-model='show' id='show-features'>Features</Switch>
    <Switch v-model='annotated' id='show-disfluencies'>Disfluencies</Switch>
  </div>
  <aside class='feature-card grid-item-1' aria-labelledby='emotions'>
    <template v-if='show && permaData'>
    <h3 id='emotions'>Emotions</h3>
    <TranscriptFeaturesEmotions :data='permaData.emotions' />
    </template>
  </aside>
  <section class='grid-item-2' aria-label='Emotion Circle'>
    <TranscriptFeaturesCanvas :data='permaData' />
  </section>
  <aside class='feature-card grid-item-3' aria-labelledby='dimensions'>
    <template v-if='show && permaData'>
    <h3 id='dimensions'>Dimensions</h3>
    <TranscriptFeaturesDimensions :data='permaData.dimensions' />
    </template>
  </aside>
</div>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-columns: 35% 26% 35%;
  grid-template-rows: 100%;
  column-gap: 2%;
  width: 100%;
  height: 100%;
}
.switch-group {
  position: absolute;
  top: -0.5rem;
  padding-inline: 0.6rem;
  width: 100%;
  display: flex;
  justify-content: end;
  gap: 1rem;
}
.grid-item-2 {
  height: 100%;
  align-content: center;
}
.feature-card {
  align-self: start;
  margin-block: 1em;
  padding-inline: 1em;
  padding-block: 0.5em;
  border-radius: 6px;
  height: fit-content;
  font-size: 0.9em;
}
.feature-card h3 {
  font-family: $text-font-family;
  font-weight: 700;
  font-size: 1em;
  margin-block: 0 0.2em;
}
.feature-list {
  list-style-type: none;
  margin-block: 0;
  padding-inline: 0;
  width: 9.5em;
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

@media screen and (max-width: 768px) {
  .grid {
    grid-template-columns: 100%;
  }
  .switch-group {
    justify-content: space-between;
  }
  .feature-card {
    position: absolute;
    top: 1rem;
    font-size: 0.72em;
    z-index: 2;
    padding-inline-end: 0;
    backdrop-filter: blur(30px);
    box-shadow:
      resp((shadow($brown, 0.14), transparent)) 0px 10px 38px -10px,
      resp((shadow($brown, 0.14), transparent)) 0px 10px 20px -15px;
  }
  .grid-item-1 {
    width: 5.6rem;
    left: 0;
  }
  .grid-item-3 {
    width: 5.9rem;
    right: 0;
  }
  .feature-list {
    width: 100%;
  }
}
</style>
