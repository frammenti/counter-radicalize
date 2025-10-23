<script setup lang='ts'>
import { useTemplateRef, computed, defineAsyncComponent } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { AlignedSegment } from '@/types/segment'

const PlotSegments = defineAsyncComponent(() => import('@/components/PlotSegments.vue'))
const Tip = defineAsyncComponent(() => import('@/components/Tip.vue'))

defineProps<{ segments: AlignedSegment[] }>()
const section = useTemplateRef('section')
const card = useTemplateRef('card')

const hasMouse = window.matchMedia('(pointer: fine)').matches

const { width: cardWidth } = useElementSize(card, { width: 1072, height: 0 })

const width = computed(() => cardWidth.value > 1072 ? cardWidth.value : 1072)
</script>

<template>
<section id='distant-reading' class='paginated' aria-label='Distant reading' ref='section'>
  <Tip :anchor='section' title='How to navigate'>
    <template v-if='hasMouse'>
      <p>Click once to set playback position. Click again to clear.</p>
    </template>
    <template v-else>
      <p>Drag to pan the graph. Tap to set playback position.</p>
    </template>
  </Tip>
  <h2>Distant reading</h2>
  <div class='p-card fade' ref='card'>
    <PlotSegments
      :segments='segments'
      :width='width'
      v-cloak
      aria-role='figure'
    />
  </div>
  <div class='grid cards'>
    <p class='p-card no-contain'>
      
    </p>
    <p class='p-card no-contain'>
      
    </p>
    <p class='p-card no-contain'>
      
    </p>
    <p class='p-card no-contain'>
      
    </p>
    <p class='p-card no-contain'>
      
    </p>
  </div>
</section>
</template>

<style scoped lang='scss'>
section > .p-card {
  height: calc(600px + var(--card-padding) * 2);
}
.grid.cards {
  grid-template-columns: 100%;
  grid-template-rows: repeat(5, auto);
}
@media screen and (width >= $tablet) {
  .grid.cards {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, auto);
  }
}
@media screen and (width >= $laptop) {
  .grid.cards {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: auto; // 336.773px
  }
}
</style>
