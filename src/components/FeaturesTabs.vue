
<script setup lang='ts'>
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import type { Stats } from '@/types/segment'

/*const { subtabColor } = */defineProps<{ subtabColor?: string }>()

const tab = defineModel<keyof Stats>('tab', { required: false })
const subtab = defineModel<keyof Stats['emotions'] | keyof Stats['fluency']>('subtab', { required: false })
</script>

<template>
<TabsRoot
  v-model='tab'
>
  <TabsList class='pagination' aria-label=''>
    <TabsTrigger class='button' value='emotions' />
    <TabsTrigger class='button' value='valence' />
    <TabsTrigger class='button' value='arousal' />
    <TabsTrigger class='button' value='dominance' />
    <TabsTrigger class='button' value='fluency' />
  </TabsList>
  <TabsContent value='emotions' tabindex='-1'>
    <h3>Emotions</h3>
    <p>
      Emotions are complex. Emotions are heavy. Emotions are an excuse.
    </p>
    </TabsContent>
  <TabsContent value='valence' tabindex='-1'>
    <h3>Valence</h3>
    <p>
      I'm very very very.
    </p>
  </TabsContent>
  <TabsContent value='arousal' tabindex='-1'>
    <h3>Arousal</h3>
    <p>
      If you are happy and you know it clap your hands.
    </p>
  </TabsContent>
  <TabsContent value='dominance' tabindex='-1'>
    <h3>Dominance</h3>
    <p>
      Rawwwwr!
    </p>
  </TabsContent>
  <TabsContent value='fluency' tabindex='-1'>
    <h3>Fluency</h3>
    <p>
      Ehm
    </p>
  </TabsContent>
</TabsRoot>
<TabsRoot
  class='tabs-root vertical'
  orientation='vertical'
  v-model='subtab'
>
  <TabsList class='pagination vertical' aria-label='' ref='emoPagination'>
    <TabsTrigger class='button' value='anger' />
    <TabsTrigger class='button' value='contempt' />
    <TabsTrigger class='button' value='disgust' />
    <TabsTrigger class='button' value='fear' />
    <TabsTrigger class='button' value='happiness' />
    <TabsTrigger class='button' value='neutral' />
    <TabsTrigger class='button' value='sadness' />
    <TabsTrigger class='button' value='surprise' />
    <TabsTrigger class='button' value='other' />
  </TabsList>
  <TabsContent value='anger' tabindex='-1'>
    <h4>Anger</h4>
    <p>
      Grrr
    </p>
  </TabsContent>
  <TabsContent value='contempt' tabindex='-1'>
    <h4>Contempt</h4>
    <p>
      Meh
    </p>
  </TabsContent>
  <TabsContent value='disgust' tabindex='-1'>
    <h4>Disgust</h4>
    <p>
      Bleah
    </p>
  </TabsContent>
  <TabsContent value='fear' tabindex='-1'>
    <h4>Fear</h4>
    <p>
      Ahhhhh
    </p>
  </TabsContent>
  <TabsContent value='happiness' tabindex='-1'>
    <h4>Happiness</h4>
    <p>
      Yay!
    </p>
  </TabsContent>
  <TabsContent value='neutral' tabindex='-1'>
    <h4>Neutral</h4>
    <p>
      Mmmmmh
    </p>
  </TabsContent>
  <TabsContent value='sadness' tabindex='-1'>
    <h4>Sadness</h4>
    <p>
      :(((
    </p>
  </TabsContent>
  <TabsContent value='surprise' tabindex='-1'>
    <h4>Surprise</h4>
    <p>
      !!!
    </p>
  </TabsContent>
  <TabsContent value='other' tabindex='-1'>
    <h4>Other</h4>
    <p>
      ???
    </p>
  </TabsContent>
</TabsRoot>
</template>

<style scoped lang='scss'>
h3 {
  font-size: $fs-huge;
}
h4 {
  font-size: $fs-xl;
}
.tabs-root.vertical {
  display: flex;
}
.pagination {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: start;
  gap: 0.5rem;

  &.vertical {
    flex-flow: column nowrap;
    width: unset;
  }

  .button {
    border-radius: $radius-max;
    height: 30px;
    width: 30px;
    padding: 0;
    border: 1px solid transparent;
    background: none;
    position: relative;
    box-shadow: none;
    will-change: border-color;
    transition: border-color 150ms ease;
    scroll-margin-block-end: 78lvh;

    &:after {
      content: '';
      height: 10px;
      width: 10px;
      border-radius: $radius-max;
      position: absolute;
      top: 33%;
      left: 33%;
      will-change: background-color;
      transition: background-color 150ms ease;
      @include theme(background-color, border);
    }
    &[data-active] {
      @include theme(border-color, text);
      &:after {
        @include theme(background-color, text);
      }
    }
    @media (hover: hover) {
      &:hover:after {
        @include theme(background-color, text);
      }
    }
  }
}
</style>
