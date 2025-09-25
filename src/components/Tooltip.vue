<script setup lang='ts'>
import { shallowRef, watch, nextTick } from 'vue'
import { TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger, type TooltipContentProps } from 'reka-ui'

const props = defineProps<{
  parent?: HTMLElement,
  disabled?: boolean,
  parentSize?: [left: number, right: number]
}>()
const open = shallowRef<boolean>(false)

function toggle() {
  if (!open.value && !props.disabled) open.value = true
}

// Placement outside of parent box
const side = shallowRef<TooltipContentProps['side']>('top')
const padding = 4
const offset = shallowRef<number>(0)

function updateSide([parentLeft, parentRight]: number[]) {
  const trigger = shallowRef()
  const functionRef = (el: any) => { trigger.value = el }
  
  watch(() => !props.disabled, async (enabled) => {
    if (enabled) {
      if (!(props.parent && trigger.value)) return
      await nextTick()
      const { left, right } = trigger.value.getBoundingClientRect()
      const distLeft = left - parentLeft
      const distRight = parentRight - right
      if (distLeft < distRight) {
        side.value = 'left'
        offset.value = distLeft + padding
      } else {
        side.value = 'right'
        offset.value = distRight + padding
      }
    }
  }, { once: true })

  return functionRef
}

const trigger = updateSide(props.parentSize!)
</script>

<template>
<TooltipRoot v-model:open='open' :disabled='disabled'>
  <TooltipTrigger as-child @click='toggle'>
    <span :ref='trigger'>
      <slot>…</slot>
    </span>
  </TooltipTrigger>
  <TooltipContent
    :side='side'
    :align='parentSize ? "end" : "center"'
    :side-offset='offset'
    :collision-boundary='parent'
    :avoid-collisions='false'
    :collision-padding='{ top: 20 }'
    hide-when-detached
    class='tooltip card'
  >
    <slot name='content'>…</slot>
    <TooltipArrow
      :width='11'
      :height='5'
      class='arrow'
    />
  </TooltipContent>
</TooltipRoot>
</template>

<style scoped lang='scss'>
:deep(.tooltip) {
  animation-duration: 125ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  outline-offset: 0;
  overflow: clip;
  z-index: 2;
  box-shadow: $box-shadow;
  color: resp($text-color);
  font-style: normal;
  font-size: 0.9em;
  padding-block: 0.3rem;
  padding-inline: 0.6rem;
}
:deep(.tooltip)[data-side='top'] {
  animation-name: fade-in-slide-up;
}
:deep(.tooltip)[data-side='left'] {
  animation-name: fade-in-slide-left;
}
:deep(.tooltip)[data-side='right'] {
  animation-name: fade-in-slide-right;
}
:deep(.arrow) {
  fill: resp($modal-color);
  stroke: resp($border-color);
  z-index: 3;
}
:deep(.tooltip) p {
  margin-block: 0;
}
</style>