
<script setup lang='ts'>
import Accordion from '@/components/Accordion.vue'
import content from '@/content/features-detail.yaml'
import { capitalize } from '@/utils'
import type { Stats } from '@/types/segment'

const { tab } = defineProps<{ tab?: keyof Stats }>()
const subtab = defineModel<keyof Stats['emotions'] | keyof Stats['fluency'] | string>('modelValue', { required: false })
</script>

<template>
<Accordion
  v-model='subtab'
  v-if='tab && tab in content'
  :content='content[tab] as Record<string, string>'
  :aria-label='`${capitalize(tab)} details`'
/>
</template>

<style scoped lang='scss'>
:deep(.accordion-item)[open] {
  @include set-feature-background();
}
</style>
