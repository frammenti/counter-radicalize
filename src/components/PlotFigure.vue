<script setup lang='ts'>
import { useTemplateRef, onMounted, watch, watchEffect } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { Plot, PlotOptions, Data, PointerOptions, LegendScales } from '@observablehq/plot'
import * as htl from 'htl'
import { playtime } from '@/stores/state'
import type { AsyncPlotOptions, MarkKey, TransformKey, MarkConstructor, TransformConstructor, Options, AsyncMark, AsyncTransform, Gradient } from '@/types/plot'

const props = defineProps<{
  options: AsyncPlotOptions,
  axisOptions?: AsyncPlotOptions,
  pointerOptions?: AsyncPlotOptions,
  timeMarkerOptions?: AsyncPlotOptions,
  gradients?: Gradient[],
  legends?: LegendScales[]
}>()

const container = useTemplateRef('container')
const axisContainer = useTemplateRef('axisContainer')
const legendContainer = useTemplateRef('legendContainer')
const pointerContainer = useTemplateRef('pointerContainer')
const timeMarkerContainer = useTemplateRef('timeMarkerContainer')
let pointer: (HTMLElement | SVGSVGElement) & Plot
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

function renderLegends() {
  if (props.legends && legendContainer.value) {
    if (plotInstance) legendContainer.value.innerHTML = ''
    for (const legend of props.legends) {
      const el = Plot.legend(legend)
      el.querySelectorAll('rect').forEach(rect => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', '50%')
        circle.setAttribute('cy', '50%')
        circle.setAttribute('r', '40%')
        rect.replaceWith(circle)
      })
      legendContainer.value.appendChild(el)
    }
  }
}

function renderPointer() {
  if (props.pointerOptions && pointerContainer.value) {
    if (plotInstance) pointerContainer.value.innerHTML = ''
    pointer = Plot.plot(appendMarks(props.pointerOptions))
    pointerContainer.value.appendChild(pointer)
  }
}

function renderTimeMarker(time: number) {
  if (props.timeMarkerOptions && timeMarkerContainer.value) {
    if (plotInstance) timeMarkerContainer.value.innerHTML = ''
    const options = {...props.timeMarkerOptions}
    const marks = options.marks as AsyncMark[]
    for (const m of marks) {
      m.data = [new Date(time * 1000)]
    }
    timeMarkerContainer.value.appendChild(Plot.plot(appendMarks(options)))
  }
}

function appendGradients(svg: HTMLElement | SVGSVGElement, gradients: Gradient[]) {
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }

  for (const g of gradients) {
    if (svg.querySelector(`#${g.id}`)) continue

    const grad = htl.svg`<linearGradient id=${g.id}
        x1=0 x2=0
        y1=${g.max}
        y2=${g.min}>
      <stop offset='0%' stop-color=${g.low}></stop>
      <stop offset='50%' stop-color=${g.low}></stop>
      <stop offset='50%' stop-color=${g.high}></stop>
      <stop offset='100%' stop-color=${g.high}></stop>
    </linearGradient>`

    defs.appendChild(grad)
  }
}

function renderPlot() {
  if (!props.options) return
  renderAxis(width.value)
  if (container.value) {
    if (plotInstance) container.value.innerHTML = ''
    const svg = Plot.plot(appendMarks(props.options))
    if (props.gradients) appendGradients(svg, props.gradients)
    plotInstance = svg
    container.value.appendChild(plotInstance)
  }
  renderLegends()
  renderPointer()
}

onMounted(async () => {
  if (!Plot) {
    Plot = await import('@observablehq/plot')
  }
  renderPlot()
  watch(() => props.options, renderPlot, { deep: true })
  if (props.timeMarkerOptions) {
    watchEffect(() => renderTimeMarker(playtime.value))
  }
  watchEffect(() => renderAxis(width.value))
})

function setPlaytime() {
  if (!pointer.value) return
  playtime.value = pointer.value.time.getTime() / 1000
}
</script>

<template>
<figure class='plot' :style='{height: options.height + "px"}'>
  <div ref='axisContainer' class='plot-axis'></div>
  <div class='plot-scroll'>
    <div ref='container' class='plot-content'></div>
    <div ref='legendContainer' class='plot-legend'></div>
    <div ref='timeMarkerContainer' class='plot-pointer'></div>
    <div ref='pointerContainer' class='plot-pointer' @mousedown='setPlaytime'></div>
  </div>
</figure>
</template>

<style scoped lang='scss'>
.plot {
  margin: 0;
  position: relative;
}
.plot-scroll {
  position: relative;
  overflow-y: visible;
  padding-block-end: 0.5rem;
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
  width: 20px;
}
.plot-legend {
  position: absolute;
  top: 5px;
  left: 40px;
  bottom: 30px;
  width: 1094px;
  display: flex;
  flex-flow: column;
  justify-content: stretch;
  overflow-y: visible;
}
.plot-legend :deep(div) {
  flex: 1;
  align-items: start;
  justify-content: start;
  margin-block-start: 0.7rem;
}
.plot-legend :deep(div):first-child {
  margin-block: 3px 32px;
}
.plot-pointer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}
:deep(svg) {
  max-width: none;
}
:deep(svg), :deep([class*="-swatches"]) {
  font-family: $text-font-family;
}
:deep(svg) [font-variant="tabular-nums"] {
  font-size: 0.5rem !important;
}
.plot-pointer :deep(svg) {
  font-variant: tabular-nums;
  font-size: 0.5rem !important;
}
@media screen and (width < $laptop) {
  .plot-scroll {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .plot-pointer {
    z-index: unset;
  }
}
</style>