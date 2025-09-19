import type { AlignedWord } from './alignment'

export interface AlignedWindow {
  words: AlignedWord[]
  disfluencies: number[]
}

export interface DisfluencyPattern {
  regex: RegExp
  classes: number[]
}
