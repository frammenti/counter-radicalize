import type { EmotionSegment, FluencySegment } from '../../src/types/segment.ts'
import { DisfluencyType } from '../../src/types/segment.ts'

function mapO<T extends object>(obj: T, fn: (v: number) => number): T {
  for (const p in obj) {
    let val = obj[p]
    obj[p] = typeof val === 'number'
    ? fn(val) as T[typeof p]
    : typeof val === 'object' && val
      ? mapO(val, fn)
      : obj[p]
  }
  return obj
}

function zipO<T extends object>(acc: T, other: T, fn: (a: number, o: number) => number): T {
  for (const p in acc) {
    let a = acc[p], o = other[p]
    acc[p] = typeof a === 'number' && typeof o === 'number'
    ? fn(a, o) as T[typeof p]
    : typeof a === 'object' && typeof o === 'object' && a && o
      ? zipO(a, o, fn)
      : acc[p]
  }
  return acc
}

export default function weightedMean(segments: EmotionSegment[], windows: FluencySegment[]) {

  // Emotions
  const { start, end, text, ...others } = segments[0]
  const stats = structuredClone(others)
  mapO(stats, () => 0)

  let segDuration = 0

  for (const seg of segments) {
    const duration = seg.end - seg.start
    segDuration += duration

    zipO(stats, seg, (a, o) => (a + o * duration))
  }

  mapO(stats, (v) => (v / segDuration))

  // Fluency
  let fluency = { fluent: 0, ...Object.fromEntries(DisfluencyType.map(k => [k, 0])) } as Record<"fluent" | typeof DisfluencyType[number], number>
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
  
  // Keys to lowercase
  fluency = Object.fromEntries(Object.entries(fluency).map(([k, v]) => [k.toLowerCase(), v]))

  // Result
  const { emotions, dimensions } = stats

  const result = { emotions, ...dimensions, fluency }
  return result
}
