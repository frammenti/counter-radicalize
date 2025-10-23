<script setup lang='ts'>
import { useTemplateRef, reactive, onMounted, watch, computed } from 'vue'
import { RovingFocusGroup, RovingFocusItem } from 'reka-ui'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { animate } from 'popmotion'
import { width, isTablet } from '@/stores/state'
import { capitalize } from '@/utils'

const {
  content,
  name = 'accordion'
} = defineProps<{
  content: Record<string, string>,
  name?: string
}>()

const active = defineModel('modelValue', { type: String, required: false })
const activeIdx = computed(() => active.value ? pos.get(active.value) : undefined )
const minHeight = computed(() => Math.max(...items.map(item => item.targetHeight)) * 1.05)
const accordion = useTemplateRef('accordion')

const items = reactive<AccordionItemState[]>([])
let pos = new Map<string, number>()

class AccordionItemState {
  el: HTMLDivElement
  value: string
  width = 0
  height = 0
  baseWidth = 0
  baseHeight = 0
  targetWidth = 0
  targetHeight = 0
  currentAnimation?: ReturnType<typeof animate>

  constructor(el: HTMLDivElement, value: string) {
    this.el = el
    this.value = value
    let trigger = el.querySelector('.accordion-trigger') as HTMLElement
    let content = el.querySelector('.accordion-content') as HTMLElement
    this.baseWidth = trigger.offsetWidth
    this.baseHeight = trigger.offsetHeight
    this.targetWidth = content.offsetWidth
    this.targetHeight = content.offsetHeight
    this.width = this.baseWidth
    this.height = this.baseHeight
  }

  stopAnimation() {
    this.currentAnimation?.stop()
    this.currentAnimation = undefined
  }

  animateTo(open: boolean) {
    this.stopAnimation()
    const fromW = this.width
    const fromH = this.height
    const toW = open ? this.targetWidth : this.baseWidth
    const toH = open ? this.targetHeight : this.baseHeight

    this.currentAnimation = animate({
      from: 0,
      to: 100,
      type: 'spring',
      stiffness: 150,
      damping: isTablet.value ? 18 : 14,
      mass: isTablet.value ? 1 : 0.6,
      velocity: 0,
      onUpdate: p => {
        this.width = fromW + (toW - fromW) * p / 100
        this.height = fromH + (toH - fromH) * p / 100
      },
      onComplete: () => {
        this.width = toW
        this.height = toH
        this.currentAnimation = undefined
      }
    })
  }

  scrollIntoView(instant: boolean = false) {
    if (!isTablet.value) return
    const i = items.indexOf(this)
    const parent = accordion.value?.$el
    let offset = 0

    if (i === 0) offset = 0
    else if (i === items.length - 1) offset = parent.scrollWidth
    else offset = this.el.offsetLeft - parent.clientWidth / 2 + this.width / 2

    instant
    ? parent.scrollLeft = offset
    : parent.scrollTo({ left: offset, behavior: 'smooth' })
  }

  open() {
    this.el.classList.remove('instant')
    this.el.setAttribute('open', 'true')
    this.scrollIntoView(true)
    this.animateTo(true)
  }

  close() {
    this.el.classList.remove('instant')
    this.el.removeAttribute('open')
    this.animateTo(false)
  }

  reopen() {
    this.el.classList.add('instant')
    this.width = this.targetWidth
    this.height = this.targetHeight
    this.el.setAttribute('open', 'true')
    this.scrollIntoView(true)
  }

  reclose() {
    this.el.classList.add('instant')
    this.el.removeAttribute('open')
  }
}

function toggle(item: AccordionItemState) {
  const isOpen = item.el.hasAttribute('open')

  if (isOpen) {
    item.close()
    active.value = undefined
  } else {
    const prev = items.find(i => i.value === active.value)
    prev?.close()
    item.open()
    active.value = item.value
  }
}

function next() {
  if (activeIdx.value !== undefined) active.value = items[activeIdx.value + 1].value
}

function prev() {
  if (activeIdx.value !== undefined) active.value = items[activeIdx.value - 1].value
}

function setAccordionState() {
  const values = Object.keys(content)
  const parent = accordion.value?.$el as HTMLDivElement

  parent
    .querySelectorAll('.accordion-item')
    .forEach((el, i) => {
      const item = new AccordionItemState(el as HTMLDivElement, values[i])
      items.push(item)
  })

  pos = new Map (values.map((k, i) => [k, i]))
}

onMounted(setAccordionState)

watch([() => content, width], () => {
  items.forEach(item => item.reclose())
  items.length = 0
  active.value = undefined
  setAccordionState()
}, { flush: 'post' })

watch(active, (n, o) => {
  const next = n ? items[pos.get(n)!] : undefined
  const prev = o ? items[pos.get(o)!] : undefined
  prev?.close()
  next?.open()
}, { flush: 'pre' })
</script>

<template>
<RovingFocusGroup
  :current-tab-stop-id='active ?? null'
  orientation='vertical'
  :prevent-scroll-on-entry-focus='true'
  loop
  ref='accordion'
  as-child
  >
  <div
    class='accordion'
    :style='{ minHeight: minHeight + "px" }'
    role='region'
    :aria-activedescendant='active ? `${name}-trigger-${active}` : undefined'
  >
    <div
      v-for='(text, label, i) in content'
      :key='i'
      class='accordion-item'
      :class='label.replace(" ", "-")'
      :style="{ width: items[i]?.width + 'px', height: items[i]?.height + 'px' }"
    >
      <h4>
        <RovingFocusItem
          :tab-stop-id='label'
          :value='label'
          as-child
        >
          <button
            class='button accordion-trigger'
            :id='`${name}-trigger-${label}`'
            :aria-controls='`${name}-sec-${label}`'
            :aria-expanded='label === active'
            @click.passive='toggle(items[i])'
          >
            {{ capitalize(label) }}
          </button>
        </RovingFocusItem>
      </h4>
      <div
        :id='`${name}-sec-${label}`'
        class='accordion-content'
        role='region'
        :aria-labelledby='`${name}-trigger-${label}`'
        :aria-hidden='!(label === active)'
      >
        <p>{{ text }}</p>
      </div>
    </div>
      <div class='accordion-controls'>
      <button
        aria-label='Previous item'
        class='accordion-control accordion-control-prev'
        :disabled='activeIdx === 0'
        @click.passive='prev'
      >
        <ChevronUp :size='18' :stroke-width='3.5' role='presentation' />
      </button>
      <button
        aria-label='Next item'
        class='accordion-control accordion-control-next'
        :disabled='activeIdx === items.length - 1'
        @click.passive='next'
        >
        <ChevronDown :size='18' :stroke-width='3.5' role='presentation' />
      </button>
    </div>
  </div>
</RovingFocusGroup>
</template>

<style scoped lang='scss'>
$expanded-width-mobile: 70cqi;

.instant, .instant * {
  transition: none !important;
}

.accordion {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: end;
  justify-content: start;
  gap: $space-xs;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-size: $fs-base;
  -webkit-tap-highlight-color: $transparent;

  &-item, &-control {
    transition:
      background-color 250ms linear,
      color 250ms linear;
    pointer-events: all;
    @include theme(background-color, modal-contrast);
  }

  &-item:not([open]), &-control:not(:disabled) {
    cursor: pointer;

    &:hover {
      @include theme(background-color, modal-hover);
    }
  }

  &-item {
    position: relative;
    flex: 0 0 auto;
    overflow: hidden;
    min-width: 0;
    min-height: 0;
    border-radius: 28px;
    will-change: color, background-color, contents, width, height;

    &:has(:focus-visible) {
      outline-offset: 2px;
      outline-width: 2px;
      outline-style: solid;
      @include theme(outline-color, primary-text);
    }
  }

  &-content {
    position: absolute;
    top: 0;
    left: 0;
    width: fit-content;
    height: fit-content;
    pointer-events: none;

    p {
      width: $expanded-width-mobile;
      margin-block: 0;
      padding: 28px;
      opacity: 0;
      transform: translateY(28px);
      transition: none;
      user-select: text;
      white-space: pre-line;
    }
  }

  &-item[open] &-content {

    p {
      pointer-events: all;
      opacity: 1;
      transform: translateY(0px);
      transition:
        opacity 400ms ease-in-out 200ms,
        transform 300ms ease-in-out;
    }
  }

  h4 {
    display: contents;
  }

  &-trigger {
    background: none;
    outline: none;
    font-size: $fs-base;
    border-radius: 28px;
    position: absolute;
    display: flex;
    flex-flow: row nowrap;
    gap: 14px;
    align-items: center;
    justify-content: start;
    padding-inline: $space-s-m $space-l-xl;
    padding-block: $space-s-m;
    transition: opacity 400ms ease-in-out 200ms;
    cursor: pointer;

    &:before, &:after {
      width: 1.1lh;
      height: 1.1lh;
    }

    &:before {
      @include svg-content('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>');
    }
  }

  &-item[open] &-trigger {
    opacity: 0;
    transition: none;
    pointer-events: none;
  }

  &-controls {
    display: none;
  }
}

@media screen and (width < $laptop) {
  .accordion {
    padding-inline: var(--card-padding);
    overflow-x: scroll;
    overflow-y: visible;
    scrollbar-width: none;
    scroll-snap-type: inline mandatory;
    scroll-behavior: auto;

    &:has(.accordion-item[open]) {
      overflow-x: hidden;
    }

    &:has(.accordion-item:first-of-type[open]) {
      .accordion-item {
        transform: translateX(calc($expanded-width-mobile * 0.5));
      }
    }

    &:has(.accordion-item:nth-last-of-type(2)[open]) {
      .accordion-item {
        transform: translateX(calc($expanded-width-mobile * -0.5));
      }
    }

    &-item {
      scroll-snap-align: center;
    }

    &-item[open] + &-item &-trigger,
    &-item:has(+ .accordion-item[open]) &-trigger {
      color: transparent;
    }

    &-item[open] + &-item &-trigger {
      &:before {
        @include svg-content('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m2 16 6-6-6-6"/></svg>');
      }
    }

    &-item:has(+ .accordion-item[open]) &-trigger {
      padding-inline: $space-l-xl $space-s-m;
      &:before { content: none; }
      &:after {
        @include svg-content('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16-6-6 6-6"/></svg>');
      }
    }
  }
}

@media screen and (width >= $laptop) {
  .accordion {
    padding-inline-start: 12%;
    flex-flow: column;
    align-items: start;
    justify-content: center;

    &-content p {
      width: 25cqi;
    }

    &-trigger {
      font-size: $fs-base;
      padding-inline: $space-xs $space-m;
      padding-block: $space-2xs-xs;
    }

    &-controls {
      position: absolute;
      inset: 0;
      width: 12%;
      flex-flow: column;
      align-items: start;
      justify-content: center;
      gap: 20px;
    }

    &[aria-activedescendant] {
      .accordion-controls {
        display: flex;
      }
    }

    &-control {
      border: none;
      border-radius: $radius-max;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;

      &-prev {
        padding-block-end: 2px;
      }

      &-next {
        padding-block-start: 2px;
      }

      &:disabled {
        opacity: 0.7;
      
        @media (prefers-color-scheme: light) {
          filter: brightness(0.9);
        }
      }
    }
  }
}

@media screen and (width >= $desktop) {
  .accordion {
    font-size: 1rem;

    &-trigger {
      font-size: $fs-m;
      padding-inline: $space-s $space-l;
    }

    &-control {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
