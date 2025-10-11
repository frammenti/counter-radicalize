export interface Segment {
  start: number
  end: number
}

export interface EmotionSegment extends Segment {
  emotions: {
    anger: number
    contempt: number
    disgust: number
    fear: number
    happiness: number
    neutral: number
    sadness: number
    surprise: number
    other: number
  }
  dimensions: {
    valence: number
    arousal: number
    dominance: number
  }
  text: string
}

export const DisfluencyType = [
  'Block',
  'Prolongation',
  'Sound repetition',
  'Word repetition',
  'Interjection'
] as const

export type Disfluency = typeof DisfluencyType[number]

export interface FluencySegment extends Segment {
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

export interface AlignedSegment extends EmotionSegment {
  fluency: number
  disfluencies: { [P in Lowercase<Disfluency>]: number }
  disfluencyText: string
}

export const dummy = {
  emotions: {
    anger: undefined,
    contempt: undefined,
    disgust: undefined,
    fear: undefined,
    happiness: undefined,
    neutral: undefined,
    sadness: undefined,
    surprise: undefined,
    other: undefined,
  },
  dimensions: {
    valence: undefined,
    arousal: undefined,
    dominance: undefined,
  },
  fluency: undefined,
  disfluencies: {
    block: undefined,
    prolongation: undefined,
    'sound repetition': undefined,
    'word repetition': undefined,
    interjection: undefined
  }
}

export interface RankedSegment extends Segment {
  index: number
  value: number
  text: string
}

export interface Stats {
  emotions: {
    anger: number,
    contempt: number,
    disgust: number,
    fear: number,
    happiness: number,
    neutral: number,
    sadness: number,
    surprise: number,
    other: number
  },
  valence: number,
  arousal: number,
  dominance: number,
  fluency: {
    fluent: number,
    block: number,
    prolongation: number,
    'sound repetition': number,
    'word repetition': number,
    interjection: number
  }
}