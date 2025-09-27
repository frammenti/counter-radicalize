import type { Ref, ComputedRef } from 'vue'
import { onKeyStroke, useMagicKeys } from '@vueuse/core'
import type { EmotionSegment } from '@/types/emotion-segment'
import type { EmotionSegment } from '@/types/segment'


export default function usePlaybackShortcuts(
  playtime: Ref<number>,
  playing: Ref<boolean>,
  segments: EmotionSegment[],
  active: ComputedRef<number>
) {
  const { control, meta } = useMagicKeys()

  function seekTo(index: number) {
    if (index == 0) playtime.value = 0.01
    else playtime.value = segments[index].start
  }

  function isTyping(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    return (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    )
  }

  // Ctrl/Cmd + Space → play/pause
  onKeyStroke(' ', (e) => {
    if (isTyping(e.target)) return
    if (!control.value && !meta.value) return
    e.preventDefault()
    playing.value = !playing.value
  }, { dedupe: true })

  // Ctrl/Cmd + Arrow Right → next segment (repeatable)
  onKeyStroke('ArrowRight', (e) => {
    if (isTyping(e.target)) return
    if (!control.value && !meta.value) return
    e.preventDefault()
    if (
      active.value >= 0 &&
      active.value < segments.length - 1
    ) seekTo(active.value + 1)
    else seekTo(0)
  })

  // Ctrl/Cmd + Arrow Left → previous segment (repeatable)
  onKeyStroke('ArrowLeft', (e) => {
    if (isTyping(e.target)) return
    if (!control.value && !meta.value) return
    e.preventDefault()
    if (active.value > 0) seekTo(active.value - 1)
    else if (active.value == 0) seekTo(segments.length - 1)
    else seekTo(0)
  })
}
