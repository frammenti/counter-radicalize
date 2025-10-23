<script setup lang='ts'>
import { ref, computed } from 'vue'
import { useIntersectionObserver, useTimeoutFn } from '@vueuse/core'
import { ToastRoot, ToastTitle, ToastDescription, ToastClose } from 'reka-ui'

const props = defineProps<{ anchor: HTMLElement | null, title?: string }>()
const isVisible = ref<boolean>(false)
const target = computed(() => props.anchor)

const DELAY = 5000 // ms
let cancelDelay: (() => void) | null = null

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry?.isIntersecting) {
      const { start, stop: cancel } = useTimeoutFn(() => {
        isVisible.value = true
        stop()
      }, DELAY)
      start()
      cancelDelay = cancel
    } else {
      cancelDelay?.()
    }
  },
  { threshold: 0.7 }
)
</script>

<template>
<ToastRoot
  v-model:open='isVisible'
  :duration='20000'
  type='background'
  class='toast-root p-card'
  as='div'
>
  <ToastTitle as='p' class='toast-title' v-if='title'>{{ title }}</ToastTitle>
  <ToastDescription as='div' class='toast-desc' @vue:mounted='stop'>
    <slot>…</slot>
  </ToastDescription>
  <ToastClose class='toast-close button-slim'>Understood</ToastClose>
</ToastRoot>
</template>

<style lang='scss'>
.toast-viewport {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 50;
  padding: var(--gutter);
  width: 100%;
  display: flex;
  flex-flow: column-reverse;
  align-items: center;
  gap: var(--gutter);
}
.toast-root {
  width: 100%;
  line-height: 1.4;
  font-size: $fs-base;
  box-shadow: $shadow-l;
  padding: $space-m;
  display: flex;
  flex-flow: column;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  gap: $space-2xs;
  @include theme(background-color, tip);

  &[data-state='open'] {
    animation: fade-in-slide-up-long 300ms cubic-bezier(0.39, 0.575, 0.565, 1) backwards;
  }

  &[data-state='closed'] {
    animation: fade-out 150ms $ease-in-sine;
  }
}
.toast-title {
  font-size: $fs-l;
  font-variation-settings: 'wght' 550;
  margin-block-end: 0.25rem;
  line-height: 1;
}
.toast-desc p {
  margin-block: $space-3xs;

  &:first-child { margin-block-start: 0; }
}
.toast-close {
  @include theme(color, tip)
}

@media screen and (width >= $tablet) {
  .toast-root {
    width: 500px;
  }
}

@media screen and (width >= $laptop) {
  .toast-viewport {
    top: var(--header-height);
    bottom: unset;
    width: 450px;
    flex-flow: column;
  }

  .toast-root {
    font-size: $fs-s;
    text-align: start;
    align-items: stretch;
    width: 100%;

    &[data-state='open'] {
      animation-name: fade-in-slide-left-long;
    }
  }

  .toast-title {
    font-size: $fs-m;
  }

  .toast-close {
    font-size: $fs-s;
    align-self: start;
  }
}
</style>
