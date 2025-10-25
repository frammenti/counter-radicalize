<script setup lang='ts'>
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { playtime, playing, hasMouse } from '@/stores/state'

const TranscriptPlayerButton = defineAsyncComponent(() => import('@/components/TranscriptPlayerButton.vue'))

const props = defineProps<{ src: string }>()
const audio = ref<HTMLAudioElement | null>(null)

// Dynamic import of hls.js
onMounted(async () => {
  if (!audio.value) return

  const Hls = (await import('hls.js')).default

  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.loadSource(props.src)
    hls.attachMedia(audio.value)
  }
})

// Sync model to player time
const updatePlaytime = useDebounceFn(() => {
  if (!audio.value) return
  playtime.value = audio.value.currentTime
}, 200)

// Sync player time to model
watch(playtime, t => {
  if (audio.value && Math.abs(audio.value.currentTime - t) > 0.3) {
    audio.value.currentTime = t
  }
})

// Sync model to player state
function updateState() {
  if (!audio.value) return
  playing.value = !audio.value.paused
}

// Sync player state to model
watch(playing,
  async (shouldPlay) => {
    if (!audio.value) return
    if (shouldPlay && audio.value.paused) {
      try {
        await audio.value.play()
      } catch (e) {
        console.warn(e)
        playing.value = false // fallback
      }
    } else if (!shouldPlay && !audio.value.paused) {
      audio.value.pause()
    }
  }
)
</script>
<template>
<audio
  controls
  preload='auto'
  id='audio-player'
  ref='audio'
  @timeupdate.passive='updatePlaytime'
  @play.passive='updateState'
  @pause.passive='updateState'
  aria-label='Audio Player'
  aria-details='transcript-body'
>
</audio>
<template v-if='!hasMouse'>
<Teleport defer to='main'>
<div class='audio-button-container'>
  <TranscriptPlayerButton
    :anchor='audio'
  />
</div>
</Teleport>
</template>
</template>

<style scoped lang='scss'>
audio {
  border-radius: $radius-max;
}
audio::-webkit-media-controls-panel {
  @include theme(background-color, background);
}

$size: $space-2xl-3xl;
$margin: calc(var(--gutter) * 1.2);

.audio-button-container {
  position: absolute;
  top: 100lvh;
  bottom: calc(var(--section-spacing) * -1);
  right: 0;
  width: calc($size + 2 * $margin);
  pointer-events: none;

  .button {
    position: sticky;
    margin: $margin;
    margin-block-end: calc($margin * 1.5);
    height: $size;
    width: $size;
    top: calc(100svh - ($size + $margin * 1.5 + env(safe-area-inset-bottom, 0)));
    z-index: 30;
    pointer-events: all;
  }
}
</style>
