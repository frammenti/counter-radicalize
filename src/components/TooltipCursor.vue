<script setup lang='ts'>
const { open, anchor } = defineProps<{
  open: boolean,
  anchor: { x: number, y: number },
  minWidth: string,
  height: string
}>()
</script>

<template>
<Teleport to='#app'>
    <div
      class='tooltip card'
      :style='{
        top: `calc(${anchor.y - 2}px - ${height})`,
        left: anchor.x + "px",
        minWidth,
        height,
        opacity: open ? "1" : "0"
      }'
    >
    <Transition name='fade' appear>
      <slot></slot>
    </Transition>
    </div>
</Teleport>
</template>
<style scoped lang='scss'>
@use '@/assets/styles/_tooltip';

.tooltip {
  position: fixed;
  pointer-events: none;
  padding-block: 0.4rem;
  transition: opacity 100ms ease-in-out;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 400ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0.5;
}
</style>
