<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import { useIntersectionObserver, whenever } from '@vueuse/core'
import { ToastRoot, ToastTitle, ToastDescription, ToastClose } from 'reka-ui'

const props = defineProps<{ anchor: HTMLElement | null, title?: string }>()
const isVisible = shallowRef<boolean>(false)
const target = computed(() => props.anchor)

const { stop } = useIntersectionObserver(target, ([entry]) => {
    isVisible.value = entry?.isIntersecting || false
  },
  { threshold: 0.7 }
)
whenever(isVisible, stop, { once: true })
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
    <slot>...</slot>
  </ToastDescription>
  <ToastClose class='toast-close button'>Ok</ToastClose>
</ToastRoot>
</template>

<style scoped lang='scss'>
.toast-title {
  font-weight: 500;
  margin-block: 0;
}
.toast-desc {
  margin-block: 0.5rem 0.6rem;
  font-size: 0.8em;
  gap: 0.5em;
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.toast-desc:first-child {
  margin-block-start: 0;
}
.button {
  font-size: .75em;
  padding-block: .375em;
  padding-inline: .625em;
  border-radius: .375em;
}
</style>
