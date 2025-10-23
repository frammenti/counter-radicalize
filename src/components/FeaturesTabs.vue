
<script setup lang='ts'>
import { RovingFocusGroup, RovingFocusItem } from 'reka-ui'
import { capitalize } from '@/utils'
import type { Stats } from '@/types/segment'

const tab = defineModel<keyof Stats>('modelValue', { required: false })
const { labels } = defineProps<{ labels: string[] }>()
</script>

<template>
<RovingFocusGroup
  v-model:current-tab-stop-id='tab'
  orientation='horizontal'
  :prevent-scroll-on-entry-focus='true'
  loop
  class='pagination'
  role='tablist'
  aria-label='Linguistic features'
>
  <RovingFocusItem
    v-for='label in labels'
    :key='label'
    :tab-stop-id='label'
    as='button'
    :id='`tab-trigger-${label}`'
    class='button'
    role='tab'
    :aria-label='capitalize(label)'
    :aria-selected='label === tab'
    :aria-controls='`tab-content-${label}`'
  />
</RovingFocusGroup>
</template>

<style lang='scss'>
.pagination {
  display: flex;
  flex-flow: row nowrap;
  gap: 0.5rem;
  pointer-events: all;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  height: 100%;

  .button {
    border-radius: 0;
    background: none;
    will-change: auto;
    padding: 0;
    flex: 1;
    height: 100%;
    position: relative;

    &:after {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 5px;
      border-radius: $radius-max;
      will-change: background-color;
      transition: background-color 150ms ease;
      @include theme(background-color, modal-contrast);
    }

    &:hover:after {
      @include theme(background-color, modal-hover);
    }

    &[aria-selected='true']:after {
      @include theme(background-color, text);
    }

    &:focus-visible {
      outline: none;
      overflow: visible;

      &:after {
        outline-offset: 2px;
        outline-width: 2px;
        outline-style: solid;
        @include theme(outline-color, primary-text);
      }
    }
  }
}
</style>
