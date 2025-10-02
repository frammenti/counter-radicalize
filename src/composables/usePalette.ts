import { computed } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import { fromNestedEntries } from '@/utils'

const dark = usePreferredDark()

export default function usePalette(colors: Record<string, any>) {
  const schemes = fromNestedEntries(Object.entries(colors), '_')
  return computed<Record<string, any>>(() => (dark.value ? schemes.dark : schemes.light))
}
