const DisfluencyType = [
  'Block',
  'Prolongation',
  'Sound repetition',
  'Word repetition',
  'Interjection'
] as const

export type DisfluencyType = typeof DisfluencyType[number]

export interface FluencySegment {
  start: number
  end: number
  fluency: number
  disfluency_type: DisfluencyType[]
}
