<script setup lang='ts'>
import { ref } from 'vue'
import { TooltipArrow, TooltipContent, TooltipRoot, TooltipTrigger } from 'reka-ui'


const open = ref<boolean>(false)

function toggle() {
  if (!open.value) open.value = true
}

</script>

<template>
<TooltipRoot v-model:open='open'>
  <TooltipTrigger as-child @click='toggle'>
    <span>
      <slot>…</slot>
    </span>
  </TooltipTrigger>
  <TooltipContent
    side='top'
    align='center'
    position-strategy='absolute'
    :avoid-collisions='false'
    :collision-padding='{ top: 20 }'
    hide-when-detached
    class='tooltip card invert'
  >
    <slot name='content'>…</slot>
    <TooltipArrow
      class='arrow'
      :width='10'
      :height='6'
      :rounded='true'
    />
  </TooltipContent>
</TooltipRoot>
</template>

<style scoped lang='scss'>
:deep(.tooltip) {
  animation-duration: 100ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  border-radius: $radius-l;

  &[data-side='top'] {
    animation-name: fade-in-slide-up;
  }

  &[data-side='left'] {
    animation-name: fade-in-slide-left;
  }

  &[data-side='right'] {
    animation-name: fade-in-slide-right;
  }

  .arrow {
    @include theme(fill, background, true);
  }
}
</style>