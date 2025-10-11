import type { AlignedSegment } from '../../src/types/segment.ts'

type Tuple<T, N extends number, R extends T[] = []> =
  R['length'] extends N ? R : Tuple<T, N, [...R, T]>

type Unnest<T, Keys extends readonly string[]> =
  Keys extends [infer K extends keyof T, ...infer Rest extends readonly string[]]
    ? Unnest<T[K], Rest>
    : number

type Ranked<T> = Partial<T> & { value: number, index: number }

function unnest<T, Keys extends readonly string[]>(obj: T, keys: Keys): Unnest<T, Keys> {
  if (keys.length === 0) return obj as Unnest<T, Keys>
  const [head, ...rest] = keys
  return unnest(obj[head as keyof T], rest) as Unnest<T, Keys>
}

function top3<T, Keys extends readonly string[]>(
  data: [...Tuple<T, 3>, ...T[]],
  keys: Keys,
  extractFn: (value: Unnest<T, Keys>, obj: T & { index: number }) => Ranked<T>
): {
  top: Tuple<Ranked<T>, 3>,
  bottom: Tuple<Ranked<T>, 3>
} {
  const ordered = data.map((o, i) => { o['index'] = i; return o })
  ordered.sort((a, b) => Number(unnest(b, keys)) - Number(unnest(a, keys)))
  return {
    top: ordered.slice(0, 3).map((o) => extractFn(unnest(o, keys), o)) as Tuple<Ranked<T>, 3>,
    bottom: ordered.slice(-3).map((o) => extractFn(unnest(o, keys), o)).reverse() as Tuple<Ranked<T>, 3>
  }
}

function extract(value: number, seg: AlignedSegment): Pick<AlignedSegment, 'start' | 'end' | 'text'> & { value: number, index: number } {
  return { index: seg.index, start: seg.start, end: seg.end, text: seg.text, value }
}

export default function rank(segments: [...Tuple<AlignedSegment, 3>, ...AlignedSegment[]]) {
  const result = {
    emotions: {},
    valence: {},
    arousal: {},
    dominance: {},
    fluency: {}
  }

  result.emotions = Object.fromEntries(
    Object.keys(segments[0]['emotions']).map(k =>
      [k, top3(segments, ['emotions', k], extract)]
    )
  )

  let k: keyof AlignedSegment['dimensions']
  for (k in segments[0]['dimensions']) {
    result[k] = top3(segments, ['dimensions', k], extract)
  }

  result.fluency = top3(segments, ['fluency'], extract)

  return result
}