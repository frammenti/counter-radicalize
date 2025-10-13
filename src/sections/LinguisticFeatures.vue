<script setup lang='ts'>
import { ref, useTemplateRef, defineAsyncComponent } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import type { Stats } from '@/types/segment'

const FeaturesTabs = defineAsyncComponent(() => import('@/components/FeaturesTabs.vue'))
const FeaturesPie = defineAsyncComponent(() => import('@/components/FeaturesPie.vue'))
const FeaturesRank = defineAsyncComponent(() => import('@/components/FeaturesRank.vue'))

type Subtab = keyof Stats['emotions'] | keyof Stats['fluency']
const tabs = useTemplateRef('tabs')
const tab = ref<keyof Stats>('emotions')
const subtab = ref<Subtab>('anger')
const subtabColor = ref<string | undefined>('red')

function updateSubtab(title?: string, color?: string) {
 if (title) subtab.value = title as Subtab
 subtabColor.value = color
}

// Tab Navigation
let touchStartX = 0
const touchThreshold = 50
const wheelThreshold = 10

function forward(direction: 'ArrowRight' | 'ArrowLeft') {
  const activeTab = tabs.value!.querySelector('.pagination [data-active]') as HTMLElement | null
  if (!activeTab) return

  const e = new KeyboardEvent('keydown', {
    key: direction,
    bubbles: true,
  })
  // @ts-ignore
  activeTab.focus({ preventScroll: true, focusVisible: false })
  activeTab.dispatchEvent(e)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(deltaX) < touchThreshold) return

  const direction = deltaX < 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}

const onWheel = useThrottleFn((e: WheelEvent) => {
  if (
    Math.abs(e.deltaX) < Math.abs(e.deltaY) ||
    Math.abs(e.deltaX) < wheelThreshold
  ) return

  const direction = e.deltaX > 0 ? 'ArrowRight' : 'ArrowLeft'
  forward(direction)
}, 300)
</script>

<template>
<section
  id='linguistic-features'
  class='paginated'
  aria-label='Linguistic features'
  @touchstart.passive='onTouchStart'
  @touchend.passive='onTouchEnd'
  @wheel.passive='onWheel'
  >
  <h2>Linguistic features</h2>
  <div class='grid cards'>
    <div
      class='p-card'
      :style='{ backgroundColor: subtabColor }'
      ref='tabs'
    >
    <FeaturesTabs
      v-model:tab='tab'
      v-model:subtab='subtab'
      :subtab-color='subtabColor'
      v-cloak
    />
    </div>
    <div class='p-card fade'>
    <FeaturesPie
      :facet='tab'
      :subfacet='subtab'
      @update:subfacet='updateSubtab'
      v-cloak
    />
    </div>
    <FeaturesRank
      :facet='tab'
      :subfacet='subtab'
      v-cloak
    />
  </div>
</section>
</template>

<style scoped lang='scss'>
$button: calc((2 * $space-xs + 1.5 * $fs-base) - 0.8rem);
$marker: calc($fs-base * 1.5);
$marker-mobile: calc($fs-s * 1.5);
$title: calc($fs-s * 1.5 + 0.5rem);

$rank-height: calc(2 * var(--card-padding) + $title + 3 * ($button + $marker));
$rank-height-mobile: calc(2 * var(--card-padding) + $title + 3 * ($button + $marker-mobile));

.grid.cards {
  grid-template-columns: 100%;
  grid-template-rows: 120cqi 100cqi repeat(2, $rank-height-mobile);
}

@media screen and (width >= $tablet) {
  .grid.cards {
    grid-template-rows: 70cqi 100cqi repeat(2, $rank-height);
  }
}

@media screen and (width >= $laptop) {
  .grid.cards {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: calc(50cqi - var(--gutter)) repeat(2, $rank-height);

    > :nth-child(3),
    > :last-child {
      grid-column: span 2;
    }
  }
}

</style>
