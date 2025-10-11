<script setup lang='ts'>
import { capitalize } from '@/utils'

defineProps<{ label: string, value?: number }>()
</script>

<template>
<span class='label'>{{ capitalize(label) }}</span>
<span v-if='value' class='value'>
  {{ Math.round(value * 100) }}<span class='percent'>%</span>
</span>
</template>

<style scoped lang='scss'>
.label, .value {
  font-size: $fs-2xl;
}
.label {
  font-variation-settings: 'wght' 600;
  margin-inline-end: 0.4em;
}
.percent {
  opacity: 0.7;
  font-size: 80%;
}
</style>