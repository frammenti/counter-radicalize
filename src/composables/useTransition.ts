import { computed, shallowRef, toValue, watch } from 'vue'
import type { Ref } from 'vue'
import { clamp } from '@/utils'

export default function useTransition(source: Ref<number>, options: { duration: number, transition: (t: number) => number }) {

  let raf = -1
  const outputRef = shallowRef(toValue(source))

  watch(source, async to => {
    cancelAnimationFrame(raf)
    await executeTransition(outputRef, outputRef.value, to, options)
  })

  function executeTransition (out: Ref<number>, from: number, to: number, options: { duration: number, transition: (t: number) => number }) {
    const start = performance.now()

    return new Promise<void>(resolve => {
      raf = requestAnimationFrame(function step (current: number) {
        const elapsed = current - start
        const progress = elapsed / options.duration
        out.value = from + (to - from) * options.transition(clamp(progress, 0, 1))

        if (progress < 1) {
          raf = requestAnimationFrame(step)
        } else {
          out.value = to
          resolve()
        }
      })
    })
  }

  return computed(() => outputRef.value)
}
