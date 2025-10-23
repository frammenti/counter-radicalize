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

  &-primary {
    &[data-state='off'] {
      @include theme(background-color, primary);
    }

    &[data-state='on'] {
      @include theme(background-color, primary-active);
    }

    &[data-state='off'].mouse-in:hover {
      @include theme(background-color, primary-hover);
    }
  }

  &-secondary {
    &[data-state='off'] {
      @include theme(background-color, secondary);
    }

    &[data-state='on'] {
      @include theme(background-color, secondary-active);
    }

    &[data-state='off'].mouse-in:hover {
      @include theme(background-color, secondary-hover);
    }
  }

  .bump-enter-active {
    animation: $animation-bump;
  }
}
</style>
