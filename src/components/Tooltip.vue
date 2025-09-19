<script setup lang='ts'>
import { TooltipProvider, TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger } from 'reka-ui'

defineProps<{ parent?: HTMLElement, disabled?: boolean }>()
</script>

<template>
<TooltipProvider :delay-duration='100' :disabled='disabled' disable-closing-trigger>
  <TooltipRoot>
    <TooltipTrigger as-child>
      <slot>…</slot>
    </TooltipTrigger>
    <TooltipContent
      side='top'
      align='center'
      :collision-boundary='parent'
      :avoid-collisions='false'
      :collision-padding='{ top: 20 }'
      hide-when-detached
      class='tooltip card'
    >
      <slot name='content'></slot>
      <TooltipArrow
        :width='11'
        :height='5'
        class='arrow'
      />
    </TooltipContent>
  </TooltipRoot>
</TooltipProvider>
</template>

<style scoped lang='scss'>
:deep(.tooltip) {
  animation-duration: 125ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  outline-offset: 0;
  overflow: clip;
  z-index: 2;
  animation-name: slide-up;
  box-shadow: $box-shadow-large;
  color: resp($text-color);
  font-style: normal;
  font-size: 0.9em;
  padding-block: 0.3rem;
  padding-inline: 0.6rem;
}
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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