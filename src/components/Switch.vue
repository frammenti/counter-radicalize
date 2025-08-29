<script setup lang='ts'>
import { SwitchRoot, SwitchThumb, Label } from 'reka-ui'

const props = defineProps<{ id: string }>()
const state = defineModel<boolean>('modelValue')
</script>

<template>
<div class='input-container'>
  <Label
    :for='id'
  >
    <slot></slot>
  </Label>
  <SwitchRoot :defaultValue=false v-model='state' :id='id'>
    <SwitchThumb class='thumb'/>
  </SwitchRoot>
</div>
</template>

<style scoped lang='scss'>
@use '../assets/styles/palette' as *;

.input-container {
  display: flex;
  flex-flow: row-reverse nowrap;
  align-items: center;
  justify-content: start;
  gap: 0.5rem;
  font-size: 0.9rem;
}
label {
  flex-shrink: 2;
}
button {
  display: block;
  padding: 0;
  width: 38px;
  height: 21px;
  background-color: resp((shadow($brown, 0.2), $black));
  border: 0.5px solid resp($border-color);
  transition: all 150ms cubic-bezier(.4,0,.2,1);
  will-change: background-color;
  position: relative;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

button[data-state='checked'] {
  background-color: resp((shadow($dark-fuchsia, 0.6), $taupe));
}
.thumb {
  display: block;
  width: 16px;
  height: 16px;
  background-color: $white;
  border-radius: 9999px;
  box-shadow: 0 2px 2px resp($shadow-color);
  transition: transform 100ms;
  transform: translateX(2px);
  will-change: transform;
}
.thumb[data-state='checked'] {
  transform: translateX(19px);
}

</style>