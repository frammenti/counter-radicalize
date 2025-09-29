export type AlignedWord = [
  start: number,
  end: number,
  word: string | '<eps>' | '<unk>'
]

export type AlignedPhone = [
  start: number,
  end: number,
  phone: string | 'sil' | 'spn'
]

export interface Alignment {
  start: number
  end: number
  tiers: {
    words: {
      type: string
      entries: AlignedWord[]
    }
    phones: {
      type: string
      entries: AlignedPhone[]
    }
  }
}

export interface AlignedWindow {
  words: AlignedWord[]
  disfluencies: number[]
}

export interface DisfluencyPattern {
  regex: RegExp
  classes: number[]
}