<script setup lang='ts'>
import { provide } from 'vue'
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
</script>

<template>
<ToastProvider label='Info'>
  <AppHeader />
  <main>
    <ToastViewport
      as='aside'
      :hotkey="['i']"
      :label='((hotkey: string) => `Info (${hotkey})`)'
      class='toast-viewport'
    />
    <div class='landing'>
      <Hero />
    </div>
    <TooltipProvider :delay-duration='100' disable-closing-trigger>
      <article>
        <About />
        <CloseReading />
        <DistantReading />
      </article>
    </TooltipProvider>
  </main>
  <AppFooter />
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
  margin: 1.5rem;
  width: 320px;
  display: flex;
  flex-flow: column;
  gap: 1.5rem;
}
:deep(.toast-root) {
  line-height: calc(1.25/.875);
  font-size: 0.875rem;
}
:deep(.toast-root)[data-state='open'] {
  animation: show 300ms cubic-bezier(0.39, 0.575, 0.565, 1) 3s backwards;
}
:deep(.toast-root)[data-state='closed'] {
  animation: hide 150ms cubic-bezier(0.47, 0, 0.745, 0.715);
}
@keyframes hide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes show {
  from {
    transform: translateX(5%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
