export const DisfluencyType = [
  'Block',
  'Prolongation',
  'Sound repetition',
  'Word repetition',
  'Interjection'
] as const

export type Disfluency = typeof DisfluencyType[number]

export interface FluencySegment {
  start: number
  end: number
  fluency: number
  disfluency_type: Disfluency[]
}

const indexMap: Record<Disfluency, number> = Object.fromEntries(
  DisfluencyType.map((d, i) => [d, i])
) as Record<Disfluency, number>

export function toIndex(list: Iterable<Disfluency>): number[] {
  return [...list]
    .map(d => indexMap[d])
    .sort((a, b) => a - b)
}
