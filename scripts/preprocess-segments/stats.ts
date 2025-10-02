import type { EmotionSegment, FluencySegment, AlignedSegment, Segment } from '../../src/types/segment.ts'
import { DisfluencyType } from '../../src/types/segment.ts'

function map<T>(obj: T, fn: (v: number) => number): T {
  let p: keyof T
  for (p in obj) {
    let val = obj[p] as any
    if (!(typeof val === 'number' || typeof val === 'object')) {
      delete obj[p]
      continue
    }
    obj[p] = typeof val === 'number'
    ? fn(val)
    : map(val, fn)
  }
  return obj
}

function zip<T>(acc: T, other: T, fn: (a: number, o: number) => number): T {
  let p: keyof T
  for (p in acc) {
    let a = acc[p] as any, o = other[p] as any
    acc[p] = typeof a === 'number'
    ? fn(a, o)
    : zip(a, o, fn)
  }
  return acc
}

export default function weightedMean(segments: EmotionSegment[], windows: FluencySegment[]) {

  // Emotions
  const { start, end, text, ...others } = segments[0]
  const stats = structuredClone(others)
  map(stats, () => 0)

  let segDuration = 0

  for (const seg of segments) {
    const duration = seg.end - seg.start
    segDuration += duration

    zip(stats, seg, (a, o) => (a + o * duration))
  }

  map(stats, (v) => (v / segDuration))

  // Fluency
  const fluency: Record<string, number> = { fluent: 0, ...Object.fromEntries(DisfluencyType.map(k => [k, 0])) }
  let totDisfluencies = 0

  for (const win of windows) {
    fluency.fluent += win.fluency
    if (win.fluency < 0.5) {
      for (const d of win.disfluency_type) {
        fluency[d]++
        totDisfluencies++
      }
    }
  }

  fluency.fluent /= windows.length

  // Normalize the percentage of each disfluency type over the disfluent windows
  const normTotDisfluencies = totDisfluencies / (1 - fluency.fluent)
  for (const d of DisfluencyType) {
    fluency[d] /= normTotDisfluencies
  }

  // Result
  const { emotions, dimensions } = stats

  const result = { emotions, ...dimensions, fluency }
  return result
}
