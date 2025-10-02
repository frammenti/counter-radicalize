<script setup lang='ts'>
import { useTemplateRef, onMounted, watch, computed } from 'vue'
import { rapid } from '@/stores/state'
import emotionColors from '@/assets/styles/emotions-canvas.module.scss'
import type { AlignedSegment } from '@/types/segment'

const props = defineProps<{ data: AlignedSegment | undefined }>()
const canvas = useTemplateRef('canvas')

const colors: number[] = Object.values(emotionColors).flatMap((str: string) =>
  str.split(', ').map(val => parseFloat(val))
)

const keys = [
  'anger', 'contempt', 'disgust', 'fear', 'happiness',
  'neutral', 'sadness', 'surprise', 'other'
] as const

const radius = computed<number>((prev) => {
  if (!props.data) {
    if (!prev) return 0.7
    return prev
  }
  return props.data.dimensions.arousal * 0.8 + 0.4
})

function weights(d?: AlignedSegment): number[] {
  return keys.map(k => d?.emotions[k] ?? 1 / keys.length)
}

function spread(d?: AlignedSegment): number {
  if (!d) return 5.0
  return d.dimensions.dominance * 10
}

function brightness(d?: AlignedSegment): number {
  if (!d) return 1.3
  return d.dimensions.valence * 1.6 + 0.5
}

function unpack(d?: AlignedSegment) {
  return { w: weights(d), s: spread(d), b: brightness(d) }
}

let cur = unpack(props.data)
let animFrame: number | null = null

// WebGL state cache
let gl: WebGLRenderingContext | null = null
let program: WebGLProgram | null = null
let uniformLocs: {
  u_colors: WebGLUniformLocation | null,
  u_weights: WebGLUniformLocation | null,
  u_points: WebGLUniformLocation | null,
  u_spread: WebGLUniformLocation | null,
  u_brightness: WebGLUniformLocation | null
} | null = null

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initGL(el: HTMLCanvasElement) {
  gl = el.getContext('webgl')
  if (!gl) return null

  el.width = 500
  el.height = 500
  gl.viewport(0, 0, el.width, el.height)

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0, 1);
    }
  `
  const fsSource = `
    precision mediump float;
    varying vec2 v_uv;
    uniform vec3 u_colors[9];
    uniform float u_weights[9];
    uniform vec2 u_points[9];
    uniform float u_spread;
    uniform float u_brightness;

    void main() {
      float total = 0.0;
      vec3 color = vec3(0.0);
      for (int i = 0; i < 9; ++i) {
        float d = distance(v_uv, u_points[i]);
        float w = u_weights[i] / (d * u_spread);
        color += u_colors[i] * w;
        total += w;
      }
      color = (color / total) * u_brightness;
      gl_FragColor = vec4(color, 1.0);
    }
  `

  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)!
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)!
  program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    return null
  }
  gl.useProgram(program)

  // Fullscreen quad
  const pos = new Float32Array([
    -1, -1,  1, -1, -1,  1,
    -1,  1,  1, -1,  1,  1
  ])
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW)
  const a_position = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(a_position)
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

  uniformLocs = {
    u_colors: gl.getUniformLocation(program, 'u_colors'),
    u_weights: gl.getUniformLocation(program, 'u_weights'),
    u_points: gl.getUniformLocation(program, 'u_points'),
    u_spread: gl.getUniformLocation(program, 'u_spread'),
    u_brightness: gl.getUniformLocation(program, 'u_brightness'),
  }

  return gl
}

function animateWeights(target: AlignedSegment | undefined, duration = 600) {
  const tar = unpack(target)

  if (rapid.value) {
    drawMeshGradient(tar)
    cur = tar
  } else {
    const start = performance.now()

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration)

      cur = {
        w: cur.w.map((w, i) => w + (tar.w[i] - w) * t),
        s: cur.s + (tar.s - cur.s) * t,
        b: cur.b + (tar.b - cur.b) * t
      }

      drawMeshGradient(cur)

      if (t < 1) animFrame = requestAnimationFrame(step)
      else cur = tar
    }
    if (animFrame) cancelAnimationFrame(animFrame)
    animFrame = requestAnimationFrame(step)
  }
}

function drawMeshGradient({ w, s, b }: { w: number[], s: number, b: number }) {
  if (!gl || !program || !uniformLocs) return

  gl.useProgram(program)

  // Circle points (fixed arrangement)
  const points: number[] = []
  const N = keys.length
  for (let i = 0; i < N; ++i) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2
    points.push(0.5 + 0.6 * Math.cos(angle), 0.5 + 0.6 * Math.sin(angle))
  }

  // Update uniforms
  gl.uniform3fv(uniformLocs.u_colors, colors)
  gl.uniform1fv(uniformLocs.u_weights, w)
  gl.uniform2fv(uniformLocs.u_points, points)
  gl.uniform1f(uniformLocs.u_spread, s)
  gl.uniform1f(uniformLocs.u_brightness, b)

  // Draw quad
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

onMounted(() => {
  if (!canvas.value) return
  initGL(canvas.value)
  animateWeights(props.data)
})

watch(() => props.data, (target) => {
  if (!target) return
  animateWeights(target)
})
</script>

<template>
  <canvas
    ref='canvas'
    :style='{
      height: `${(radius * 100).toFixed(0)}%`,
      transition: rapid ? undefined : "height 300ms cubic-bezier(0.47, 0, 0.745, 0.715)"
    }'
    aria-label='Emotion Circle'
    alt='A colorful circular gradient representing the emotional content of the current speech segment.'
  ></canvas>
</template>

<style scoped>
canvas {
  height: 100%;
  width: auto;
  clip-path: circle(45%);
  will-change: height;
}
</style>
