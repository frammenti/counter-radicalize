<script setup lang='ts'>
import { ref, computed } from 'vue'
import { useIntersectionObserver, useTimeoutFn } from '@vueuse/core'
import { ToastRoot, ToastTitle, ToastDescription, ToastClose } from 'reka-ui'

const props = defineProps<{ anchor: HTMLElement | null, title?: string }>()
const isVisible = ref<boolean>(false)
const target = computed(() => props.anchor)

const DELAY = 3000 // ms
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
  :duration='30000'
  type='background'
  class='toast-root p-card'
  as='div'
>
  <ToastTitle as='p' class='toast-title' v-if='title'>{{ title }}</ToastTitle>
  <ToastDescription as='div' class='toast-desc'>
    <slot>…</slot>
  </ToastDescription>
  <ToastClose class='toast-close button'>Understood</ToastClose>
</ToastRoot>
</template>

<style scoped lang='scss'>
.toast-title {
  font-size: $fs-m;
  font-variation-settings: 'wght' 550;
  margin-block-end: 0.25rem;
  line-height: 1;
}
.toast-desc {
  margin-block-end: 10px;
  gap: 0.5em;
  display: flex;
  align-items: start;
  justify-content: space-between;
  text-align: center;
}
.toast-close {
  font-size: inherit;
  border-radius: $max-radius;
  padding-inline: $button-padding-inline-xs;
  padding-block: $button-padding-block-xs;
  align-self: start;
  font-variation-settings: 'wght' 300;
  @include theme(background-color, background, true);
  @include theme(color, tip)
}
@media screen and (width < $laptop) {
  .toast-title {
    font-size: $fs-l;
  }
  .toast-close {
    align-self: center;
  }
}
</style>
