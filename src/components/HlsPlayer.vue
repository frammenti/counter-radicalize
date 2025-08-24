<script setup lang='ts'>
import { shallowRef, onMounted, watch } from 'vue'

const playtime = defineModel<number>('playtime', { type: Number, required: true })
const props = defineProps<{ src: string }>()

const audio = shallowRef<HTMLAudioElement | null>(null)

// Dynamic import of hls.js
onMounted(async () => {
  if (!audio.value) return

  if (audio.value.canPlayType('application/vnd.apple.mpegurl')) {
      audio.value.src = props.src
    } else {
      const Hls = (await import('hls.js')).default
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(props.src)
        hls.attachMedia(audio.value)
      }
    }
})

// Sync model to audio player
function onTimeUpdate() {
  if (audio.value) {
    playtime.value = audio.value.currentTime
  }
}

// Sync audio player to model
watch(playtime, t => {
  if (audio.value && Math.abs(audio.value.currentTime - t) > 0.25) {
    audio.value.currentTime = t
  }
})
</script>

<template>
  <audio
    controls
    preload='auto'
    ref='audio'
    @timeupdate='onTimeUpdate'
    aria-label='Audio Player'
  >
  </audio>
</template>

