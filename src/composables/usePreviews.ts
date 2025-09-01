import { inject } from 'vue'
import type { Preview } from '@/types/preview'

export const previewsKey = Symbol('previews')

export function usePreviews(): Record<string, Preview> {
  const previews = inject<Record<string, Preview>>(previewsKey)
  if (!previews) {
    throw new Error('No previews found')
  }
  return previews
}
