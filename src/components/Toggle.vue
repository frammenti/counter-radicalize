<script setup lang='ts'>
import { Toggle } from 'reka-ui'

defineProps<{ title?: string, textOn: string, textOff: string }>()
const state = defineModel('modelValue', { type: Boolean, required: true })
</script>

<template>
  <Toggle
    v-model='state'
    :aria-label='`Toggle ${title ?? ""}`'
    class='button'
    @mouseenter='($event.currentTarget as HTMLButtonElement).classList.add("mouse-in")'
    @click='($event.currentTarget as HTMLButtonElement).classList.remove("mouse-in")'
  >
  <Transition name='bump' mode='out-in'>
    <span :key='Number(state)'>{{ state ? textOn : textOff }}</span>
  </Transition>
  </Toggle>
</template>

<style scoped lang='scss'>
.button {
  font-size: $fs-base;
  font-variation-settings: 'wght' 300;
  
  &[data-state='off'] {
    @include theme(background-color, primary-active);

    &.secondary {
      @include theme(background-color, secondary-active);
    }
  }

  &[data-state='on'] {
    @include theme(background-color, primary);

      &.secondary {
        background-color: oklch(0.3678 0.097024 134.341);

        @media (prefers-color-scheme: dark) {
          background-color: oklch(0.3956 0.081569 97.0101);
        }
    }
  }

  &[data-state='off'].mouse-in:hover {
    @include theme(background-color, primary-hover);

      &.secondary {
      @include theme(background-color, secondary-hover);
    }
  }

  .bump-enter-active {
    animation: $animation-button;
  }
}
</style>
