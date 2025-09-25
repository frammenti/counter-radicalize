<script setup lang='ts'>
import { SwitchRoot, SwitchThumb, Label } from 'reka-ui'

const props = defineProps<{ id: string }>()
const state = defineModel<boolean>('modelValue')
</script>

<template>
<div class='input-container'>
  <SwitchRoot :defaultValue=false v-model='state' :id='props.id' class='button'>
    <SwitchThumb class='thumb'/>
  </SwitchRoot>
  <Label
    :for='props.id'
  >
    <slot></slot>
  </Label>
</div>
</template>

<style scoped lang='scss'>
.input-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: start;
  gap: 0.5em;
}
label {
  flex-shrink: 2;
  transition: all 150ms cubic-bezier(.4,0,.2,1);
  font-size: 0.9em;
}
.button {
  display: block;
  padding: 0;
  width: 2.25em;
  height: 1.25em;
  background-color: resp((shadow($brown, 0.2), shadow($lilac, 0.2)));
  border: 0.5px solid resp($border-color);
  transition: all 150ms cubic-bezier(.4,0,.2,1);
  will-change: background-color;
  position: relative;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  box-shadow: none;
}
.button[data-state='checked'] {
  background-color: resp((shadow($orchid, 0.6), $taupe));
}
.thumb {
  display: block;
  width: 1em;
  height: 1em;
  background-color: $white;
  border-radius: 9999px;
  box-shadow: 0 2px 2px resp($shadow-color);
  transition: transform 100ms;
  position: absolute;
  top: 0.075em;
  inset-inline-start: 0.1em;
  will-change: transform;
}
.thumb[data-state='checked'] {
  transform: translateX(100%);
}
</style>
