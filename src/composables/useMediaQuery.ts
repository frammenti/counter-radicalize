import { ref, type Ref } from 'vue'

const cache = new Map<[MediaFeature, MediaValue], { ref: Ref<boolean>, count: number }>()

type MediaFeature = 'hover' | 'pointer' | 'prefers-reduced-motion' | 'orientation' | 'prefers-color-scheme'
type MediaValue = 'hover' | 'none' | 'fine' | 'coarse' | 'reduce' | 'light' | 'dark' | 'portrait' | 'landscape'

export default function useMediaQuery(query: MediaFeature, target: MediaValue) {
  if (cache.has([query, target])) {
    const entry = cache.get([query, target])!
    entry.count++
    return entry.ref
  }

  const mq = window.matchMedia(`(${query}: ${target})`)
  const matches = ref(mq.matches)

  cache.set([query, target], { ref: matches, count: 1 })

  const update = (e: MediaQueryListEvent) => {
    matches.value = e.matches
  }

  mq.addEventListener('change', update)

  return matches
}
