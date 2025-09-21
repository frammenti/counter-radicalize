<script setup lang='ts'>
import { onMounted, shallowRef, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import * as Plot from '@observablehq/plot'

const props = defineProps<{
  options: any,
  axisOptions?: any,
  pointerOptions?: any
}>()

const container = shallowRef<HTMLDivElement | null>(null)
const axisContainer = shallowRef<HTMLDivElement | null>(null)
const pointerContainer = shallowRef<HTMLDivElement | null>(null)
let plotInstance: Node | null = null
const { width } = useElementSize(axisContainer)

function renderAxis() {
  if (props.axisOptions && axisContainer.value) {
    props.axisOptions.width = width.value
    if (plotInstance) axisContainer.value.innerHTML = ''
    axisContainer.value.appendChild(Plot.plot(props.axisOptions))
  }
}

function renderPointer() {
  if (props.pointerOptions && pointerContainer.value) {
    props.axisOptions.width = width.value
    if (plotInstance) pointerContainer.value.innerHTML = ''
    pointerContainer.value.appendChild(Plot.plot(props.pointerOptions))
  }
}

function renderPlot() {
  if (!props.options) return
  renderAxis()
  renderPointer()
  if (container.value) {
    if (plotInstance) container.value.innerHTML = ''
    plotInstance = Plot.plot(props.options)
    container.value.appendChild(plotInstance)
  }
}

onMounted(renderPlot)
watch(() => props.options, renderPlot, { deep: true })
watch(width, renderAxis)
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

<style scoped lang="scss">
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
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
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
</style>