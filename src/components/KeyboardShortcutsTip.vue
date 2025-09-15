<script setup lang="ts">
import { shallowRef, computed } from 'vue'
import { useIntersectionObserver, whenever } from '@vueuse/core'
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import KeyboardShortcut from '@/components/KeyboardShortcut.vue';

const props = defineProps<{ anchor: HTMLElement | null }>()
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
  <ToastProvider :duration='30000' label='Keyboard shortcuts info'>
    <ToastViewport
      class='toast-viewport'
      :hotkey="['h']"
      :label='((hotkey: string) => `Keyboard shortcuts (${hotkey})`)'
      as='aside'
    />
    <ToastRoot
      v-model:open='isVisible'
      type='background'
      class='toast-root card'
      as='div'
    >
      <ToastTitle as='p' class='toast-title'>Keyboard shortcuts</ToastTitle>
      <ToastDescription as='ul' class='toast-desc'>
        <li>
          <KeyboardShortcut
            modifier='meta'
            :keys='["ArrowLeft"]'
            id='shortcut-prev'
          >
            prev segment
          </KeyboardShortcut>
        </li>
        <li>
          <KeyboardShortcut
            modifier='meta'
            :keys='["space"]'
            id='shortcut-play'
          >
            play/pause
          </KeyboardShortcut>
        </li>
        <li>
          <KeyboardShortcut
            modifier='meta'
            :keys='["ArrowRight"]'
            id='shortcut-next'
          >
            next segment
          </KeyboardShortcut>
        </li>
      </ToastDescription>
      <ToastClose class='toast-close button'>Ok</ToastClose>
    </ToastRoot>
  </ToastProvider>
</template>

<style scoped lang='scss'>
$toast-margin: 1.5rem;

:deep(.toast-viewport) {
  --page-margin: calc((100vw - 56rem) / 2);
  position: fixed;
  top: $header-height;
  right: 0;
  z-index: 50;
  margin-block: $toast-margin;
  margin-inline-end: $toast-margin;
  width: 320px;
}
:deep(.toast-root) {
  line-height: calc(1.25/.875);
  font-size: 0.875rem;
}
.toast-title {
  font-weight: 500;
  margin-block: 0;
}
.toast-desc {
  margin-block: 0.5rem 0.6rem;
  padding-inline-start: 0;
  list-style-type: none;
  font-size: 0.8em;
  gap: 0.5em;
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.button {
  font-size: .75em;
  padding-block: .375em;
  padding-inline: .625em;
  border-radius: .375em;
}

/* Animations */
:deep(.toast-root[data-state='open']) {
  animation: show 300ms cubic-bezier(0.39, 0.575, 0.565, 1) 3s backwards;
}
:deep(.toast-root[data-state='closed']) {
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