<script setup lang='ts'>
import { useTemplateRef, onMounted, defineAsyncComponent } from 'vue'
import type { AlignedSegment } from '@/types/segment'

const PlotSegments = defineAsyncComponent(() => import('@/components/PlotSegments.vue'))
const Tip = defineAsyncComponent(() => import('@/components/Tip.vue'))

defineProps<{ segments: AlignedSegment[] }>()
const section = useTemplateRef('section')
const card = useTemplateRef('card')

const hasMouse = window.matchMedia('(pointer: fine)').matches
let width = 1072

onMounted(() => {
if (window.matchMedia('(width > 1280px)').matches)
width = card.value!.clientWidth - 56
})
</script>

<template>
<section id='distant-reading' class='paginated' aria-label='Distant reading' ref='section'>
  <Tip :anchor='section' title='How to navigate'>
    <template v-if='hasMouse'>
      Click once to set playback position. Click again to clear.
    </template>
    <template v-else>
      Drag to pan the graph. Tap to set playback position.
    </template>
  </Tip>
  <h2>Distant reading</h2>
  <div class='p-card fade' ref='card'>
    <PlotSegments
      :segments='segments'
      :width='width'
      v-cloak
    />
  </div>
  <div class='grid cards'>
    <div class='p-card'></div>
    <div class='p-card'></div>
    <div class='p-card'></div>
    <div class='p-card'></div>
    <div class='p-card'></div>
  </div>
</section>
</template>

<style scoped lang='scss'>
section > .p-card {
  height: calc(600px + $card-padding * 2);
}
.grid.cards {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 336.773px;
}
@media screen and (width < $laptop) {
  .grid.cards {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
  }
}
@media screen and (width < $tablet) {
  .grid.cards {
    grid-template-columns: 100%;
  }
}
</style>
