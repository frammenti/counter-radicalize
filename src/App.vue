<script setup lang='ts'>
import { useTemplateRef, provide, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { ToastProvider, ToastViewport } from 'reka-ui'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import Hero from '@/sections/Hero.vue'
import About from '@/sections/About.vue'
import CloseReading from '@/sections/CloseReading.vue'
import DistantReading from '@/sections/DistantReading.vue'
import LinguisticFeatures from '@/sections/LinguisticFeatures.vue'
import segments from '@/stores/segments.json'
import previews from '@/stores/previews.json'
import { previewsKey } from '@/composables/usePreviews'

provide(previewsKey, previews)
const landing = useTemplateRef('landing')
const heroVisible = ref(true)
useIntersectionObserver(landing, ([entry], _) => {
  heroVisible.value = entry?.isIntersecting || false
})
</script>

<template>
<ToastProvider label='Info'>
  <ToastViewport
    :hotkey="['i']"
    :label='((hotkey: string) => `Info (${hotkey})`)'
    id='viewport'
    class='toast-viewport'
  />
  <a id='skip' class='button button-primary' href='#about'>Skip to content</a>
  <AppHeader :opaque='!heroVisible' />
  <main>
    <div class='landing' ref='landing'>
      <div class='wrapper full-page'>
        <Hero v-once/>
      </div>
    </div>
    <article>
      <div class='wrapper'>
        <About v-once />
      </div>
      <div class='wrapper'>
        <CloseReading :segments='segments' v-once />
      </div>
      <div class='wrapper'>
        <DistantReading :segments='segments' v-once />
      </div>
      <div class='wrapper'>
        <LinguisticFeatures v-once />
      </div>
    </article>
  </main>
  <AppFooter v-once />
</ToastProvider>
</template>

<style lang='scss'>
.toast-viewport {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 50;
  margin: 0;
  padding: var(--gutter);
  width: 100%;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: var(--gutter);
}
@include set-background('.landing');
.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}
#skip {
  position: fixed;
  top: calc($header-height + 1rem);
  left: 1rem;
  transition: none;
  user-select: none;
  z-index: 10;
}
#skip:not(:focus-visible) {
  background-color: transparent;
  color: transparent;
  box-shadow: none;
  pointer-events: none;
}
</style>
