<script setup lang='ts'>
import { provide } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import Hero from '@/sections/Hero.vue'
import About from '@/sections/About.vue'
import Transcript from '@/sections/Transcript.vue'
import LinguisticFeatures from '@/sections/LinguisticFeatures.vue'
import previews from '@/stores/previews.json'
import { previewsKey } from '@/composables/usePreviews'

provide(previewsKey, previews)
</script>

<template>
  <AppHeader />
  <main>
    <div class='landing'>
      <Hero />
    </div>
    <article>
      <About />
      <Transcript />
      <LinguisticFeatures />
    </article>
  </main>
  <AppFooter />
</template>

<style scoped lang='scss'>
@include set-background('.landing');
.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}
</style>
