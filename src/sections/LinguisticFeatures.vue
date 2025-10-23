<script setup lang='ts'>
import { ref, defineAsyncComponent } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import content from '@/content/features.yaml'
import { capitalize } from '@/utils'
import type { Stats } from '@/types/segment'

const FeaturesTabs = defineAsyncComponent(() => import('@/components/FeaturesTabs.vue'))
const FeaturesDesc = defineAsyncComponent(() => import('@/components/FeaturesDesc.vue'))
const FeaturesPie = defineAsyncComponent(() => import('@/components/FeaturesPie.vue'))
const FeaturesRank = defineAsyncComponent(() => import('@/components/FeaturesRank.vue'))

type Subtab = keyof Stats['emotions'] | keyof Stats['fluency'] | string
const tab = ref<keyof Stats>('emotions')
const subtab = ref<Subtab>()
const tabs = Object.keys(content) as Array<keyof Stats>

// Tab Navigation
let touchStartX = 0
const touchThreshold = 150
const wheelThreshold = 20

function forward(direction: 'right' | 'left') {
  const i = tabs.indexOf(tab.value)
  tab.value = direction === 'left'
    // @ts-ignore
    ? tabs.at(i -  1)
    // @ts-ignore
    : tabs.at(i === tabs.length - 1 ? 0 : i + 1)
}

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const deltaX = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(deltaX) < touchThreshold) return

  const direction = deltaX < 0 ? 'right' : 'left'
  forward(direction)
}

const onWheel = useThrottleFn((e: WheelEvent) => {
  if (
    Math.abs(e.deltaX) < Math.abs(e.deltaY) ||
    Math.abs(e.deltaX) < wheelThreshold
  ) return

  const direction = e.deltaX > 0 ? 'right' : 'left'
  forward(direction)
}, 300)
</script>

<template>
<section
  id='linguistic-features'
  class='paginated'
  aria-label='Linguistic features'
  @wheel.passive='onWheel'
  @touchstart.passive='onTouchStart'
  @touchend.passive='onTouchEnd'
  >
  <h2>Linguistic features</h2>
  <div
    class='tab-container p-card fade'
    @click.self.passive='subtab = undefined'
  >
    <div class='tab-controls'>
      <FeaturesTabs
        v-model='tab'
        :labels='tabs'
        v-cloak
      />
    </div>
    <div
      class='grid'
      :class='{ variable: ["emotions", "fluency"].includes(tab) }'
      :id='`tab-content-${tab}`'
      role='tabpanel'
      :aria-labelledby='`tab-header-${tab}`'
    >
      <div
        v-for='text, label in content as Record<string, string>'
        v-show='label === tab'
        :key='label'
        class='tab-text'
      >
        <h3 :id='`tab-header-${label}`'>{{ capitalize(label) }}</h3>
        <p>
          {{ text }}
        </p>
      </div>
      <div class='tab-desc'>
        <FeaturesDesc
          :tab='tab'
          v-model='subtab'
          v-cloak
        />
      </div>
      <div class='tab-pie'>
        <FeaturesPie
          :facet='tab'
          v-model='subtab'
          v-cloak
        />
      </div>
    </div>
  </div>
  <div
    class='grid cards'
  >
    <FeaturesRank
      :facet='tab'
      :subfacet='subtab'
      v-cloak
    />
  </div>
</section>
</template>

<style scoped lang='scss'>
$button: calc((3 * $space-xs + 1.5 * $fs-base));
$title: calc($fs-l * 1.5 + $space-s);

$button-mobile: calc((3 * $space-xs + 1.5 * $fs-s));
$title-mobile: calc($fs-m * 1.5 + $space-s);

$rank-height: calc(2 * var(--card-padding) + $title + 3 * ($button));
$rank-height-mobile: calc(2 * var(--card-padding) + $title-mobile + 3 * ($button-mobile));

.grid {
  pointer-events: none;
}

.tab {
  &-container {
    padding-block-start: 0;
    overflow: hidden;

    .grid {
      padding-block-start: 0;
      grid-template-columns: 100%;
      grid-template-rows: auto min(100cqi, calc(510px + var(--gutter) * 2)) 0;

      &.variable {
        grid-template-rows: auto min(100cqi, calc(510px + var(--gutter) * 2)) calc((3lh + 28px * 2) * 1.05);
      }
    }
  }

  &-controls {
    flex-shrink: 0;
    width: 100%;
    margin-inline: auto;
    height: calc(var(--card-padding) * 2);
  }

  &-text {
    width: 100%;
    align-self: start;

    h3 {
      font-size: $fs-huge;
    }
  }

  &-pie {
    width: 100%;
    grid-row: 2 / 3;
    margin-block: var(--gutter);
  }

  &-desc {
    width: calc(100% + var(--card-padding) * 2);
    margin-inline: calc(var(--card-padding) * -1);
    align-self: end;
  }
}

.grid.cards {
  grid-template-columns: 100%;
  grid-template-rows: repeat(2, $rank-height-mobile);
}

@media screen and (width >= $tablet) {
  .grid.cards {
    grid-template-columns: 100%;
    grid-template-rows: repeat(2, $rank-height);
  }
}

@media screen and (width >= $laptop) {
  .tab {
    &-container {

      .grid, .grid.variable {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: minmax(178px, min-content) calc(min(510px, 38cqi) + var(--gutter) * 2);
      }
    }

    &-text {
      grid-column: 2 / 4;
      :deep(h3) { text-align: end; margin-block-start: 0; } 
    }

    &-desc {
      width: 100%;
      margin-inline: 0;
      grid-column: 1 / 2;
      grid-row: 1 / 3;
      align-self: center;

      &:after, &:before {
        content: none;
      }
    }

    &-pie {
      grid-row: span 1;
      grid-column: span 2;
      align-self: start;

      :deep(.pie-chart) {
        width: 38cqi;
      }
    }
  }
}

@media screen and (width >= $desktop) {
  .tab {
    &-controls { max-width: 900px; }
  }

  .grid.cards {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: $rank-height;
  }
}
</style>
