<script setup lang='ts'>
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardArrow
} from 'reka-ui'
import { usePreviews } from '@/composables/usePreviews'
import { canHover } from '@/stores/state'

const props = defineProps<{ href: string }>()
const previews = canHover ? usePreviews() : {}
const metadata = previews[props.href]
</script>

<template>
  <HoverCardRoot v-if='canHover && metadata' :open-delay='100' :close-delay='150'>
    <HoverCardTrigger
      :href=props.href
      class='out'
      target='_blank'
      rel='noreferrer noopener'>
      <slot>…</slot>
    </HoverCardTrigger>
    <HoverCardContent
      class='popover card'
      align='center'
      side='top'
      positionStrategy='absolute'
      :align-flip=true
      :prioritize-position=true
      :side-offset=5
      :collision-padding='{ top: 64 }'
    >
      <div class='popover-content'>
        <div class='popover-image' v-if='metadata.image' :style="{backgroundImage: 'url(' + metadata.image + ')'}"></div>
        <h5>{{ metadata.title }}</h5>
        <p>{{ metadata.description }}</p>
        <a
          :href='href'
          target='_blank'
          rel='noreferrer noopener'
        >{{ metadata.url }}</a>
      </div>
    <HoverCardArrow
      class='arrow'
      :width='10'
      :height='6'
      :rounded='true'
    />
  </HoverCardContent>
  </HoverCardRoot>
  <a v-else
    :href=props.href
    class='out'
    target='_blank'
    rel='noreferrer noopener'
  >
  <slot>…</slot>
  </a>
</template>

<style scoped lang='scss'>
.out {
  text-decoration: underline dotted 1px currentColor;
  display: inline;

  &:after {
    content: "↗";
    display: inline-flex;
    margin-inline-start: 0.15em;
    font-family: $font-family-heading;
    font-variation-settings: 'wght' 900;
    font-size: 1.2em;
    line-height: 1;
  }
}

:deep(.popover) {
  width: 250px;
  animation-duration: 125ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  outline-offset: 0;
  overflow: clip;
  z-index: 2;
  text-align: start;
  text-wrap: wrap;
  @include theme(color, text);

  &[data-side='top'] {
    animation-name: fade-in-slide-up;
    box-shadow: $shadow-xl;
  }

  &[data-side='bottom'] {
    animation-name: fade-in-slide-down;
    box-shadow: $shadow-xl-r;
  }

  .arrow {
    z-index: 3;
    @include theme(fill, modal-alt);
  }

  .popover-image {
    margin-inline: calc($space-s-m * -1);
    margin-block: calc($space-s-m * -1) 15px;
    height: 125px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.9;
  }

  .popover-content {
    width: 100%;
    display: flex;
    flex-flow: column;
    height: fit-content;
    h5 {
      font-variation-settings: 'wght' 550;
      margin-block: 0;
      width: 100%;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
    }
    p {
      font-size: $fs-s;
      width: 100%;
      margin-block: 0.25rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      line-clamp: 5;
    }
    a {
      font-size: $fs-xs;
      border-radius: $radius-max;
      width: fit-content;
      padding-inline: 6px;
      padding-block: 0.5px;
      font-variation-settings: 'wght' 300;
      color: currentColor;
      margin: 0;
      margin-inline-start: -3px;
      @include theme(background-color, shadow);

    &:hover {
      @include theme(background-color, shadow-hover);
    }
    }
  }
}
</style>