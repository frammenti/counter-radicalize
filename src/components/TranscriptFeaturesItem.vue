<script setup lang='ts'>
import { capitalize } from '@/utils'

defineProps<{ label: string, value?: number }>()
</script>

<template>
<span>
  <span class='label'>{{ capitalize(label) }}</span>&numsp;<span v-if='value' class='value'>{{ Math.round(value * 100) }}<span class='percent'>%</span>
</span>
</span>
</template>

<style scoped lang='scss'>
.label, .value {
  font-size: $fs-2xl;
}
.label {
  font-variation-settings: 'wght' 600;
}
.percent {
  opacity: 0.7;
  font-size: 80%;
}
</style>
