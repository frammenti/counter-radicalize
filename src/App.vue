<script setup lang='ts'>
import { useTemplateRef, provide, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { TooltipProvider, ToastProvider, ToastViewport } from 'reka-ui'
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
  <TooltipProvider :delay-duration='100' disable-closing-trigger>
    <ToastViewport
      as='aside'
      :hotkey="['i']"
      :label='((hotkey: string) => `Info (${hotkey})`)'
      class='toast-viewport'
    />
    <a id='skip' class='button' href='#about'>Skip to content</a>
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
        <div class='wrapper section'>
          <CloseReading :segments='segments' v-once />
        </div>
        <div class='wrapper section'>
          <DistantReading :segments='segments' v-once />
        </div>
        <div class='wrapper section'>
          <LinguisticFeatures v-once />
        </div>
      </article>
    </main>
    <AppFooter v-once />
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
#skip {
  position: absolute;
  top: calc($header-height + 1rem);
  left: 1rem;
  transition: none;
  user-select: none !important;
}
#skip:not(:focus-visible) {
  background-color: transparent;
  color: transparent;
  box-shadow: none;
  pointer-events: none;
}
// Toast
:deep(.toast-viewport) {
  position: fixed;
  top: $header-height;
  right: 0;
  z-index: 50;
  padding: $gutter;
  width: 450px;
  display: flex;
  flex-flow: column;
  gap: $gutter;
}
:deep(.toast-root) {
  line-height: calc(1.25/.875);
  font-size: $fs-s;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: $button-padding-inline;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  gap: clamp(.4375rem, .4259rem + .0581vw, .5rem);
  @include theme(background-color, tip);

  &[data-state='open'] {
    animation: fade-in-slide-left-long 300ms cubic-bezier(0.39, 0.575, 0.565, 1) backwards;
  }

  &[data-state='closed'] {
    animation: fade-out 150ms cubic-bezier(0.47, 0, 0.745, 0.715);
  }
}

@media screen and (width < $laptop) {
  :deep(.toast-viewport) {
    top: unset;
    bottom: 0;
    flex-flow: column-reverse;
    width: 100%;
    align-items: center;
  }
  :deep(.toast-root) {
    width: 500px;
    font-size: $fs-base;
    align-items: center;
    text-align: center;

    &[data-state='open'] {
      animation-name: fade-in-slide-up-long;
    }
  }
}
@media screen and (width < $tablet) {
  :deep(.toast-viewport) {
    padding: $gutter-mobile;
    gap: $gutter-mobile;
  }

  :deep(.toast-root) {
    width: 100%;
  }
}
</style>
