<script setup lang='ts'>
import { ref, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { playtime, playing } from '@/stores/state'

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
        playing.value = false // fall back
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
  ref='audio'
  id='audio-player'
  @timeupdate='updatePlaytime'
  @play='updateState'
  @pause='updateState'
  aria-label='Audio Player'
  aria-details='transcript-body'
>
</audio>
</template>

<style scoped lang='scss'>
  #audio-player {
    margin-block-start: 5%;
  }
</style>
