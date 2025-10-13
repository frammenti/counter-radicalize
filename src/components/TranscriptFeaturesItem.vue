<script setup lang='ts'>
import { capitalize } from '@/utils'

defineProps<{ label: string, value?: number }>()
</script>

<template>
<span class='entry'>
  <span class='label'>{{ capitalize(label) }}</span>&nbsp;<span v-if='value' class='value'>{{ Math.round(value * 100) }}<span class='percent'>%</span>
</span>
</span>
</template>

<style scoped lang='scss'>
.entry {
  font-size: $fs-2xl;
}
.label {
  font-variation-settings: 'wght' 600;
  margin-inline-end: 0.1em;
}
.percent {
  opacity: 0.7;
  font-size: 80%;
}
</style>
