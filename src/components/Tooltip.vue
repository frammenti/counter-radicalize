<script setup lang='ts'>
import { ref, watch, nextTick } from 'vue'
import { TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger, type TooltipContentProps } from 'reka-ui'

const props = defineProps<{
  parent?: HTMLElement | null,
  disabled?: boolean,
  parentSize?: [left: number, right: number]
}>()
const open = ref<boolean>(false)

function toggle() {
  if (!open.value && !props.disabled) open.value = true
}

// Placement outside of parent box
const side = ref<TooltipContentProps['side']>('top')
const padding = 4
const offset = ref<number>(0)

function updateSide([parentLeft, parentRight]: number[]) {
  const trigger = ref()
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

const trigger = props.parentSize ? updateSide(props.parentSize) : undefined
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
@use '@/assets/styles/_tooltip'
</style>