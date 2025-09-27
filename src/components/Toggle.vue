<script setup lang='ts'>
import { Toggle } from 'reka-ui'
import { LockKeyhole, LockKeyholeOpen } from 'lucide-vue-next'

defineProps<{ title?: string }>()
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
    <component
      :is='state ? LockKeyhole : LockKeyholeOpen'
      :size='15'
      :stroke-width='1.5'
    />
  </Toggle>
</template>

<style scoped lang='scss'>
.button {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  font-size: 1rem;
  line-height: 1rem;
  color: resp($text-color);
  border: 0.5px solid resp($border-color);
  border-radius: 0.4rem;
  box-shadow: $box-shadow-small;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0.1rem;

  &[data-state='on'] {
    background-color: resp($button-off-color);
  }

  &[data-state='off'] {
    background-color: resp($background-color);
  }

  &[data-state='off'].mouse-in:hover {
    background-color: resp((shadow($brown, 0.1) shadow($taupe, 0.075)));
  }
}
svg {
  fill: none;
}
</style>
