import { type Ref } from 'vue'
import { onKeyStroke, useMagicKeys, useThrottleFn } from '@vueuse/core'
import { playtime, playing, rapid } from '@/stores/state'
import type { EmotionSegment } from '@/types/segment'


export default function usePlaybackShortcuts(
  segments: EmotionSegment[],
  active: Ref<number>
) {
  const { control, meta } = useMagicKeys()

  const seekTo = useThrottleFn((idx: number) => {
    if (idx === 0 && active.value < 0) active.value = 0
    playtime.value = segments[idx].start
  }, 150)

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
    rapid.value = e.repeat
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
    rapid.value = e.repeat
    if (active.value > 0) seekTo(active.value - 1)
    else if (active.value === 0) seekTo(segments.length - 1)
    else seekTo(0)
  })

  // Reset rapid state
  onKeyStroke(['Control', 'Meta', 'ArrowRight', 'ArrowLeft'], (e) => {
    if (isTyping(e.target)) return
    e.preventDefault()
    rapid.value = false
  }, {eventName: 'keyup'})
}
