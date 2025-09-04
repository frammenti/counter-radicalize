<script setup lang='ts'>
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardArrow
} from 'reka-ui'
import { usePreviews } from '@/composables/usePreviews'

const props = defineProps<{ href: string }>()
const supportsHover = window.matchMedia('(any-hover: hover)').matches
const previews = supportsHover ? usePreviews() : {}
const metadata = previews[props.href]
</script>

<template>
  <HoverCardRoot v-if='supportsHover && metadata' :open-delay='100' :close-delay='150'>
    <HoverCardTrigger
      :href=props.href
      target='_blank'
      rel='noreferrer noopener'>
      <slot>…</slot>
    </HoverCardTrigger>
    <HoverCardContent
      class='popover card'
      align='center'
      side='top'
      :align-flip=true
      :prioritize-position=true
      :side-offset=5
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
      :width=10
      :height=6
      :rounded=true
    />
  </HoverCardContent>
  </HoverCardRoot>
  <a v-else
    :href=props.href
    target='_blank'
    rel='noreferrer noopener'
  >
  <slot>…</slot>
  </a>
</template>

<style scoped lang='scss'>
:deep(.popover) {
  width: 250px;
  animation-duration: 125ms;
  animation-timing-function: ease-in-out;
  will-change: transform opacity;
  outline-offset: 0;
  overflow: clip;
  z-index: 20;
}
:deep(.popover[data-side='top']) {
  animation-name: slide-up;
  box-shadow: $box-shadow-large;
}
:deep(.popover[data-side='bottom']) {
  animation-name: slide-down;
  box-shadow: $box-shadow-large-reverse;
}
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
:deep(.arrow) {
  fill: resp($modal-color);
  stroke: resp($border-color);
  z-index: 21;
}
.popover-content {
  width: 100%;
  display: flex;
  flex-flow: column;
  height: fit-content;
}
.popover-image {
  margin-inline: -20px;
  margin-block: -20px 15px;
  height: 125px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.9;
}
.popover-content h5 {
  margin-block: 0;
  width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
.popover-content p {
  font-size: 0.8rem;
  width: 100%;
  margin-block: 0.25rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
}
.popover-content a {
  font-size: 0.7rem;
  border-radius: 5rem;
  background-color: resp($shadow-color);
  width: fit-content;
  padding-inline: 6px;
  padding-block: 0.5px;
  font-weight: inherit;
  color: currentColor;
  margin: 0;
  margin-inline-start: -3px;
}
.popover-content a:hover {
  background-color: resp((shadow($brown, 0.1), shadow($taupe, 0.3)));
}
</style>