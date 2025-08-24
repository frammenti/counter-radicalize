<script setup lang='ts'>
import { ref } from 'vue'
import HlsPlayer from './components/HlsPlayer.vue'
import Transcript from './components/Transcript.vue'
import EmotionCircle from './components/EmotionCircle.vue'
import segments from '../models/outputs/segments_emotion.json'

const playtime = ref<number>(0)

</script>

<template>
  <main role='main' aria-labelledby='main-title'>
    <h1 id='main-title'>Counter-Radicalize</h1>
    <HlsPlayer 
      src='/counter-radicalize/hls/message.m3u8'
      v-model:playtime='playtime'
    />
    <section id='transcript' aria-label='Transcript'>
      <Transcript
        v-model:playtime='playtime'
        :segments='segments'
      />
    </section>
    <section id='circle' aria-label='Emotion Circle'>
      <EmotionCircle
        :playtime='playtime'
        :segments='segments'
      />
    </section>
  </main>
</template>

<style scoped>
#transcript {
  max-height: 40%;
  overflow-y: scroll;
}

#circle {
  height: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
