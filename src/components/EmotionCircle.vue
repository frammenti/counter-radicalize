<script setup lang='ts'>
// import type { Segment } from '../typing/segment'
import type { Segment } from '../types/segment'

// const props = defineProps<{ playtime: number, segments: Segment[] }>()
const props = defineProps<{ data: Segment | undefined }>()

</script>

<template>
    <img src="/web-app-manifest-512x512.png" alt="Emotion Circle" />
</template>

<style scoped>
img {
  width: auto;
  height: 80%;
}
</style>
