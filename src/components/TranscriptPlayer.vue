<script setup lang='ts'>
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  src: string
  playtime: number
  playing: boolean
}>()

const emit = defineEmits<{
  'update:playtime': [value: number]
  'update:playing': [value: boolean]
}>()

const audio = ref<HTMLAudioElement | null>(null)

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

// Sync player time to model
watch(() => props.playtime, t => {
  if (audio.value && Math.abs(audio.value.currentTime - t) > 0.25) {
    audio.value.currentTime = t
  }
})

// Sync player state to model
watch(
  () => props.playing,
  async (shouldPlay) => {
    if (!audio.value) return
    if (shouldPlay && audio.value.paused) {
      try {
        await audio.value.play()
      } catch (e) {
        console.warn('Autoplay blocked:', e)
        emit('update:playing', false) // fall back
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
    @timeupdate='emit("update:playtime", audio ? audio.currentTime : 0)'
    @play='emit("update:playing", true)'
    @pause='emit("update:playing", false)'
    aria-label='Audio Player'
    aria-details='transcript-body'
  >
  </audio>
</template>

