<script setup lang='ts'>
import { useTemplateRef, provide, shallowRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { TooltipProvider, ToastProvider, ToastViewport } from 'reka-ui'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import Hero from '@/sections/Hero.vue'
import About from '@/sections/About.vue'
import CloseReading from '@/sections/CloseReading.vue'
import DistantReading from '@/sections/DistantReading.vue'
import previews from '@/stores/previews.json'
import { previewsKey } from '@/composables/usePreviews'

provide(previewsKey, previews)
const landing = useTemplateRef('landing')
const heroVisible = shallowRef(true)
useIntersectionObserver(landing, ([entry], _) => {
  heroVisible.value = entry?.isIntersecting || false
})
</script>

<template>
<ToastProvider label='Info'>
  <TooltipProvider :delay-duration='100' disable-closing-trigger>
    <ToastViewport
      as='aside'
      :hotkey="['i']"
      :label='((hotkey: string) => `Info (${hotkey})`)'
      class='toast-viewport'
    />
    <AppHeader :opaque='!heroVisible' />
    <main>
      <div class='landing' ref='landing'>
        <Hero />
      </div>
      <article>
        <About />
        <CloseReading />
        <DistantReading />
      </article>
    </main>
    <AppFooter />
  </TooltipProvider>
</ToastProvider>
</template>

<style scoped lang='scss'>
@include set-background('.landing');
.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}
:deep(.toast-viewport) {
  position: fixed;
  top: $header-height;
  right: 0;
  z-index: 50;
  padding: 1.5rem;
  width: 371px;
  display: flex;
  flex-flow: column;
  gap: 1.5rem;
}
:deep(.toast-root) {
  line-height: calc(1.25/.875);
  font-size: 0.875rem;
}
:deep(.toast-root)[data-state='open'] {
  animation: fade-in-slide-left-long 300ms cubic-bezier(0.39, 0.575, 0.565, 1) backwards;
}
:deep(.toast-root)[data-state='closed'] {
  animation: fade-out 150ms cubic-bezier(0.47, 0, 0.745, 0.715);
}
@media screen and (width < $laptop) {
  :deep(.toast-viewport) {
    top: unset;
    bottom: 0;
    flex-flow: column-reverse;
  }
  :deep(.toast-root) {
    font-size: 0.9rem;
  }
}
@media screen and (width < $tablet) {
  :deep(.toast-viewport) {
    width: 100%;
  }
  :deep(.toast-root) {
    text-align: end;
  }
}
</style>
