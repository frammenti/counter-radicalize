<script setup lang='ts'>
import { ref, useTemplateRef } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useThrottleFn } from '@vueuse/core'
import type { AlignedSegment } from '@/types/segment'

const props = defineProps<{ segments: AlignedSegment[] }>()
const pagination = useTemplateRef('pagination')
const tab = ref('emotions')

let touchStartX = 0
const threshold = 50

function forward(direction: 'ArrowRight' | 'ArrowLeft') {
  const active = pagination.value!.$el.querySelector('[data-active]') as HTMLElement | null
  if (!active) return

  const evt = new KeyboardEvent('keydown', {
    key: direction,
    bubbles: true,
  })
  active.focus({ preventScroll: true, focusVisible: false })
  active.dispatchEvent(evt)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(deltaX) < threshold) return

  const direction = deltaX < 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}

const onWheel = useThrottleFn((e: WheelEvent) => {
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return

  const threshold = 10
  if (Math.abs(e.deltaX) < threshold) return

  const direction = e.deltaX > 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}, 300)

</script>

<template>
<section id='linguistic-features' class='paginated' aria-label='Linguistic features'>
  <hgroup>
    <h2>Linguistic features</h2>
  </hgroup>
  <div class='grid'>
  <TabsRoot
    class='tabs-root card'
    v-model='tab'
    @touchstart.passive='onTouchStart'
    @touchend.passive='onTouchEnd'
    @wheel.passive='onWheel'
  >
    <TabsList class='pagination' aria-label='' ref='pagination'>
      <TabsTrigger class='button' value='emotions' />
      <TabsTrigger class='button' value='arousal' />
      <TabsTrigger class='button' value='valence' />
      <TabsTrigger class='button' value='fluency' />
    </TabsList>
    <TabsContent value='emotions' tabindex='-1'>
      <h3>Emotions</h3>
      <p>
      </p>
    </TabsContent>
    <TabsContent value='arousal' tabindex='-1'>
      <h3>Arousal</h3>
      <p>
      </p>
    </TabsContent>
    <TabsContent value='valence' tabindex='-1'>
      <h3>Valence</h3>
      <p>
      </p>
    </TabsContent>
    <TabsContent value='fluency' tabindex='-1'>
      <h3>Fluency</h3>
      <p>
      </p>
    </TabsContent>
  </TabsRoot>
  <div style='background-color: red; height: 100%; width: 100%'></div>
  <div class='card'></div>
  <div class='card'></div>
  </div>
</section>
</template>

<style scoped lang='scss'>
.grid {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 2fr 0.5fr 0.5fr;
  gap: 2rem;
  height: 80%;

  :first-child {
    grid-row: 1 / 4;
  }
}
.card {
  height: 100%;
}
.pagination {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: start;
  gap: 0.5rem;

  .button {
    border-radius: $max-radius;
    height: 30px;
    width: 30px;
    padding: 0;
    border: 1px solid transparent;
    background: none;
    position: relative;
    box-shadow: none;
    will-change: border-color;
    transition: border-color 150ms ease;

    &:after {
      content: '';
      height: 10px;
      width: 10px;
      border-radius: $max-radius;
      background-color: resp($border-color);
      position: absolute;
      top: 33%;
      left: 33%;
      will-change: background-color;
      transition: background-color 150ms ease;
    }

    &[data-active] {
      border-color: resp($text-color);
      &:after { background-color: resp($text-color); }
    }
  }
}

@media screen and (hover: hover) {
  .pagination .button:hover:after { background-color: resp($text-color); }
}
</style>
