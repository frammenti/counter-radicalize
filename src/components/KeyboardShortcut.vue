<script setup lang='ts'>
import { ChevronLeft, ChevronRight, Command } from 'lucide-vue-next'

const keyMap = {
  cmd: Command,
  ArrowRight: ChevronRight,
  ArrowLeft: ChevronLeft,
} as const

type KeyMap = typeof keyMap
type KeyName = keyof KeyMap

const props = defineProps<{
  modifier?: 'meta' | 'ctrl' | 'alt' | 'shift'
  keys: (KeyName | string)[]
}>()

const isMac = navigator.platform.startsWith('Mac')

const sysModifier =
  props.modifier == 'meta' ? (isMac ? 'cmd' : 'ctrl') : props.modifier

const keyList = [...props.keys]
if (sysModifier) keyList.unshift(sysModifier)
</script>

<template>
<div class='shortcut-container'>
  <div class='shortcut-keys'>
    <template v-for='(k, i) in keyList' :key='i'>
      <kbd v-if='k in keyMap' class='kbd kbd-square'>
        <component :is='keyMap[k as KeyName]' :stroke-width='1.5' :size='k == "cmd" ? 15 : 18' />
      </kbd>
      <kbd v-else class='kbd kbd-long'>{{ k }}</kbd>
      <template v-if='i < keyList.length - 1'>+</template>
    </template>
  </div>
  <p class='command'><slot></slot></p>
</div>
</template>


<style scoped lang='scss'>
.shortcut-container {
  width: fit-content;
  text-align: center;
  margin-block: $space-3xs;
  cursor: default;
  user-select: none;
  font-size: $fs-xs;
}
.shortcut-keys {
  font-size: $fs-xs;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  font-variation-settings: 'wght' 450;
}
.kbd {
  min-width: 1.9lh;
  height: 1.9lh;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  margin-inline: 0.3rem;
  border: 1px solid;
  border-radius: $radius-m;
  @include theme(border-color, text-hover);
  &:first-child {
    margin-inline-start: 0;
  }
  &:last-child {
    margin-inline-end: 0;
  }
}
.command {
  margin-block: 0.2rem 0;
}
.kbd-square {
  width: 2em;
}
.kbd-long {
  padding-inline: 0.6rem;
}
.lucide {
  fill: none;
}
.lucide-chevron-left {
  margin-inline-end: 0.1rem;
}
.lucide-chevron-right {
  margin-inline-start: 0.1rem;
}
</style>
