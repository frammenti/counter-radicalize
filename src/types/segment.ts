export interface Segment {
  start: number
  end: number
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
    arousal: number
    valence: number
    dominance: number
  }
  text: string
}
