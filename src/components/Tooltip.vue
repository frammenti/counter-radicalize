<script setup lang='ts'>
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardArrow
} from 'reka-ui'

const { label = 'tooltip' } = defineProps<{ label?: string }>()
</script>

<template>
<HoverCardRoot :open-delay='100' :close-delay='150'>
  <HoverCardTrigger as-child>
    <span
      class='tooltip-trigger'
      tabindex='0'
      aria-label='Info'
      :aria-describedby='`${label}-content`'
    >
      <slot>…</slot>
    </span>
  </HoverCardTrigger>
  <HoverCardContent
    side='top'
    align='center'
    position-strategy='absolute'
    :disable-update-on-layout-shift='true'
    class='tooltip card invert'
    :id='`${label}-content`'
    role='tooltip'
  >
    <slot name='content'>…</slot>
    <HoverCardArrow
      class='arrow'
      :width='10'
      :height='6'
      :rounded='true'
    />
  </HoverCardContent>
</HoverCardRoot>
</template>

<style scoped lang='scss'>
.tooltip-trigger {
  min-width: 1lh;
  border-radius: $radius-xl;
}
:deep(.tooltip) {
  animation-duration: 100ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  border-radius: $radius-l;
  pointer-events: all;
  user-select: text;

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