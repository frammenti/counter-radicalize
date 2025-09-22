<script setup lang='ts'>
import { onMounted, shallowRef, watch, watchEffect } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { PlotOptions, Data, PointerOptions } from '@observablehq/plot'
import type { AsyncPlotOptions, MarkKey, TransformKey, MarkConstructor, TransformConstructor, Options, AsyncTransform } from '@/types/plot'

const props = defineProps<{
  options: AsyncPlotOptions,
  axisOptions?: AsyncPlotOptions,
  pointerOptions?: AsyncPlotOptions
}>()

const container = shallowRef<HTMLDivElement | null>(null)
const axisContainer = shallowRef<HTMLDivElement | null>(null)
const pointerContainer = shallowRef<HTMLDivElement | null>(null)
let Plot: typeof import('@observablehq/plot')
let plotInstance: Node | null = null
const { width } = useElementSize(axisContainer)


function mark<K extends MarkKey>(type: K, data?: Data, options?: Options[K] | AsyncTransform<K>): ReturnType<typeof Plot[K]> {
  return (Plot[type] as MarkConstructor<K>)(data, options)
}

function transform<K extends MarkKey, T extends TransformKey>(_: K, type: T, options: Options[K] & PointerOptions): ReturnType<typeof Plot[T]> {
  return (Plot[type] as TransformConstructor<T>)(options)
}

function appendMarks(options: AsyncPlotOptions): PlotOptions {
  options.marks = (options.marks ?? []).map((m) => {
    if ('type' in m) {
      if ('type' in m.options) {
        return mark(m.type, m.data, transform(m.type, m.options.type, m.options.options))
      } else {
        return mark(m.type, m.data, m.options)
      }
    } else {
      return m
    }
  })
  return options as PlotOptions
}

function renderAxis(plotWidth: number) {
  if (props.axisOptions && axisContainer.value) {
    props.axisOptions.width = plotWidth
    if (plotInstance) axisContainer.value.innerHTML = ''
    axisContainer.value.appendChild(Plot.plot(appendMarks(props.axisOptions)))
  }
}

function renderPointer() {
  if (props.pointerOptions && pointerContainer.value) {
    if (plotInstance) pointerContainer.value.innerHTML = ''
    pointerContainer.value.appendChild(Plot.plot(appendMarks(props.pointerOptions)))
  }
}

function renderPlot() {
  if (!props.options) return
  renderAxis(width.value)
  if (container.value) {
    if (plotInstance) container.value.innerHTML = ''
    plotInstance = Plot.plot(appendMarks(props.options))
    container.value.appendChild(plotInstance)
  }
  renderPointer()
}

onMounted(async () => {
  if (!Plot) {
    Plot = await import('@observablehq/plot')
  }
  renderPlot()
  watch(() => props.options, renderPlot, { deep: true })
  watchEffect(() => renderAxis(width.value))
})
</script>

<template>
<figure class='plot' :style='{height: options.height + "px"}'>
  <div ref='axisContainer' class='plot-axis'></div>
  <div class='plot-scroll'>
    <div ref='container' class='plot-content'></div>
    <div ref='pointerContainer' class='plot-pointer'></div>
  </div>
</figure>
</template>

<style scoped lang='scss'>
.plot {
  margin: 0;
  position: relative;
}
.plot-axis {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  pointer-events: none;
}
.plot-axis:before,
.plot-axis:after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  background-color: resp($background-color);
  z-index: -1;
}
.plot-axis:before {
  left: -5px;
  width: 42px;
}
.plot-axis:after {
  right: -5px;
  width: 25px;
}
.plot-scroll {
  position: relative;
}
.plot-pointer {
  position: absolute;
  top: 0;
  left: 0;
}
:deep(svg) {
  max-width: none;
}
@media screen and (max-width: 1200px) {
  .plot-scroll {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
}
</style>