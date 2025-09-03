<script setup lang='ts'>
import { ChevronLeft, ChevronRight, Command } from 'lucide-vue-next'

const keyMap = {
  cmd: Command,
  arrowRight: ChevronRight,
  arrowLeft: ChevronLeft,
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
<aside class='shortcut-container'>
  <div class='shortcut-keys'>
    <template v-for='(k, i) in keyList' :key='i'>
      <kbd v-if='k in keyMap' class='kbd kbd-square'>
        <component :is='keyMap[k as KeyName]' :stroke-width='1.5' :size='18' />
      </kbd>
      <kbd v-else class='kbd kbd-long'>{{ k }}</kbd>
      <template v-if='i < keyList.length - 1'>+</template>
    </template>
  </div>
  <p class='command'><slot></slot></p>
</aside>
</template>


<style scoped lang='scss'>
.shortcut-container {
  width: fit-content;
  text-align: center;
  opacity: 0.25;
  cursor: default;
  user-select: none;
}
.shortcut-keys {
  font-size: 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  font-weight: 450;
}
.kbd {
  min-width: 2em;
  height: 2em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  margin-inline: 0.3rem;
  border: 1px solid resp((shadow($raisin, 0.3), shadow($taupe, 0.4)));
  border-radius: 0.4em;
}
.command {
  font-size: 0.9em;
  margin-block: 0.1em 0;
}
.kbd-square {
  width: 2em;
}
.kbd-long {
  padding-inline: 0.6em;
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
