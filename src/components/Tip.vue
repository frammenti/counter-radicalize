<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import { useIntersectionObserver, useTimeoutFn } from '@vueuse/core'
import { ToastRoot, ToastTitle, ToastDescription, ToastClose } from 'reka-ui'

const props = defineProps<{ anchor: HTMLElement | null, title?: string }>()
const isVisible = shallowRef<boolean>(false)
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
  class='toast-root card'
  as='div'
>
  <ToastTitle as='p' class='toast-title' v-if='title'>{{ title }}</ToastTitle>
  <ToastDescription as='div' class='toast-desc'>
    <slot>…</slot>
  </ToastDescription>
  <ToastClose class='toast-close button'>Ok</ToastClose>
</ToastRoot>
</template>

<style scoped lang='scss'>
.toast-title {
  font-weight: 500;
  margin-block: 0 0.5rem;
  text-align: start;
}
.toast-desc {
  margin-block: 0 1rem;
  font-size: 0.8em;
  gap: 0.5em;
  display: flex;
  align-items: start;
  justify-content: space-between;
  text-align: start;
}
.toast-close {
  font-size: .75em;
  padding-block: .375em;
  padding-inline: .75em;
  border-radius: .375rem;
  text-align: start;
}
@media screen and (width < $tablet) {
  .toast-close {
    padding-inline: 1.25em;
  }
}
</style>
