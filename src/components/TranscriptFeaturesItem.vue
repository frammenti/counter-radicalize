<script setup lang='ts'>
defineProps<{ label: string, value: number, short: string }>()
</script>

<template>
<span class='label full-label'>{{ label }}</span>
<span class='label short-label' :title='label'>{{ short }}</span>
<span class='value'>
  {{ Math.round(value * 100) }}<span class='percent'>%</span>
</span>
</template>

<style scoped>
.label {
  font-weight: 500;
  margin-inline-end: 0.4em;
}
.short-label {
  display: none;
}
.value {
  font-size: 0.85em;
}
.percent {
  opacity: 0.7;
}
@media screen and (width < $mobile) {
  .full-label {
    display: none;
  }
  .short-label {
    display: inline;
  }
}
</style>