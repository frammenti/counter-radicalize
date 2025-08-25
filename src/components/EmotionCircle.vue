<script setup lang='ts'>
import { shallowRef, onMounted, computed, watch } from 'vue'
import type { Segment } from '../types/segment'

const props = defineProps<{ data: Segment | undefined }>()
const canvas = shallowRef<HTMLCanvasElement | null>(null)

const radius = computed(() => {
  if (!props.data) return 0.7
  return (props.data.dimensions.arousal) * 0.8 + 0.4
})

const brightness = computed(() => {
  if (!props.data) return 1.3
  return (props.data.dimensions.valence) * 1.5 + 0.5
})

const colors = [
  [1.0, 0.0, 0.0],    // anger: red
  [0.545, 0.27, 0.07],// contempt: brown
  [0.0, 0.5, 0.0],    // disgust: green
  [0.5, 0.0, 0.5],    // fear: purple
  [1.0, 1.0, 0.0],    // happiness: yellow
  [0.5, 0.5, 0.5],    // neutral: gray
  [0.0, 0.0, 1.0],    // sadness: blue
  [1.0, 0.65, 0.0],   // surprise: orange
  [1.0, 0.75, 0.8],   // other: pink
]

const keys = [
  'anger', 'contempt', 'disgust', 'fear', 'happiness',
  'neutral', 'sadness', 'surprise', 'other'
] as const

let weights = keys.map(k => props.data?.emotions[k] ?? 1 / keys.length)
let animFrame: number | null = null

function animateWeights(target: number[], duration = 600) {
  const start = performance.now()

  function step(now: number) {
    const t = Math.min(1, (now - start) / duration)
    const current = weights.map((w, i) => w + (target[i] - w) * t)
    drawMeshGradient(current)
    if (t < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      weights = target
    }
  }
  if (animFrame) cancelAnimationFrame(animFrame)
  animFrame = requestAnimationFrame(step)
}

function drawMeshGradient(w: number[]) {
  const el = canvas.value
  if (!el) return
  const gl = el.getContext('webgl')
  if (!gl) return

  // Set canvas size
  el.width = 500
  el.height = 500
  gl.viewport(0, 0, el.width, el.height)

  // Vertex shader
  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0, 1);
    }
  `
  // Fragment shader
  const fsSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform vec3 u_colors[9];
    uniform float u_weights[9];
    uniform vec2 u_points[9];

    void main() {
      float total = 0.0;
      vec3 color = vec3(0.0);
      for (int i = 0; i < 9; ++i) {
        float d = distance(v_uv, u_points[i]);
        float w = u_weights[i] / (d * 8.0 + 0.05); // 8.0 controls spread
        color += u_colors[i] * w;
        total += w;
      }
      color /= total;
      gl_FragColor = vec4(color, 1.0);
    }
  `

  function compileShader(type: number, source: string) {
    if (!gl) return null
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return shader
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource)
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource)
  const program = gl.createProgram()!
  gl.attachShader(program, vs!)
  gl.attachShader(program, fs!)
  gl.linkProgram(program)
  gl.useProgram(program)

  // Full canvas square
  const pos = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ])
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  // Arrange points in circle
  const points: number[] = []
  const N = keys.length
  for (let i = 0; i < N; ++i) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2
    points.push(0.5 + 0.6 * Math.cos(angle), 0.5 + 0.6 * Math.sin(angle))
  }

  // Set uniforms
  gl.uniform3fv(gl.getUniformLocation(program, 'u_colors'), colors.flat())
  gl.uniform1fv(gl.getUniformLocation(program, 'u_weights'), w)
  gl.uniform2fv(gl.getUniformLocation(program, 'u_points'), points)

  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

onMounted(() => {
  drawMeshGradient(weights)
})

watch(() => props.data, (d) => {
  if (!d) return
  let target = keys.map(k => d.emotions[k])
  animateWeights(target)
})
</script>

<template>
  <canvas
    ref='canvas'
    :style="{
      height: `${(radius * 100).toFixed(0)}%`,
      filter: `brightness(${brightness.toFixed(2)})`
    }">
  </canvas>
</template>

<style scoped>
canvas {
  width: auto;
  clip-path: circle(45%);
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}
</style>
