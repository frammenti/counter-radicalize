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
  font-size: 0.9em;
}
.button {
  padding: 0;
  width: 2.3em;
  height: 1.3em;
  background-color: resp($button-off-color);
  border: 1px solid resp($border-color);
  position: relative;
  box-shadow: $box-shadow-small;
}
.button[data-state='checked'] {
  background-color: resp($button-on-color);
}
.thumb {
  position: absolute;
  top: 1px;
  inset-inline-start: 1px;
  width: 1em;
  height: 1em;
  background-color: $white;
  border-radius: $max-radius;
  box-shadow: 0 2px 2px resp($shadow-color);
  transition: transform 100ms;
  will-change: transform;
}
.thumb[data-state='checked'] {
  transform: translateX(100%);
}
</style>
