<script setup lang='ts'>
import { provide } from 'vue'
import Header from '@/sections/Header.vue'
import Hero from '@/sections/Hero.vue'
import About from '@/sections/About.vue'
import Transcript from '@/sections/Transcript.vue'
import LinguisticFeatures from '@/sections/LinguisticFeatures.vue'
import Footer from '@/sections/Footer.vue'
import previews from '@/stores/previews.json'

provide('previews', previews)
</script>

<template>
  <Header />
  <main>
    <div class='landing'>
      <Hero />
    </div>
    <About />
    <Transcript />
    <LinguisticFeatures />
  </main>
  <Footer />
</template>

<style scoped lang='scss'>
.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}

@include set-background('.landing');
</style>
