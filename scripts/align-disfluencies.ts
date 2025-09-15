import fs from 'node:fs'
import segmentData from '../models/outputs/segments_emotion.json' with { type: 'json' }
import fluencyData from '../models/outputs/segments_fluency.json' with { type: 'json' }
import alignmentData from '../models/outputs/alignment.json' with { type: 'json' }
import type { EmotionSegment } from '../src/types/emotion-segment'
import type { FluencySegment } from '../src/types/fluency-segment'
import type { Alignment, AlignedWord } from '../src/types/alignment'
import type { DisfluencyPattern } from '../src/types/disfluency-pattern'

type Disfluency = FluencySegment['disfluency_type'][number]

interface AlignedWindow {
  words: AlignedWord[]
  disfluencies: Disfluency[]
}

const segments = segmentData as EmotionSegment[]
const windows = fluencyData as FluencySegment[]
const alignment = alignmentData as Alignment
const alignedWords = alignment.tiers.words.entries

var alignedWindows: AlignedWindow[] = []
for (const win of windows) {
  const words = alignedWords.filter(([start, end, word]) =>
    start > win.start &&
    end < win.end &&
    word != '<eps>' &&
    word != '<unk>'
  )
  // Don't display disfluency types of higher fluency windows
  const disfluencies = win.fluency < 0.5 ? win.disfluency_type : null
  if (words.length > 0 && disfluencies) alignedWindows.push({ words: words, disfluencies: disfluencies })
}

// Concat disfluencies if words are the same
alignedWindows = alignedWindows.reduce((acc: AlignedWindow[], curr: AlignedWindow) => {
  const sameWords = acc.find(win => win.words == curr.words)
  sameWords ?
  sameWords.disfluencies = sameWords.disfluencies.concat(curr.disfluencies)
  : acc.push(curr)
  return acc
}, [])

const result: DisfluencyPattern[][] = segments.map(({ start, end }) => {
  const disfluencies = alignedWindows.filter(win => win.words[0][0] > start && win.words[win.words.length - 1][1] < end)
  const segPatterns: DisfluencyPattern[] = []
  for (const dis of disfluencies) {
    const words = dis.words.map(w => w[2])
    segPatterns.push({
      regex: `(\\b${words.join('\\b\\W*\\b')}\\b)`,
      className: dis.disfluencies
  })
  }
  return segPatterns
})

fs.writeFileSync('./src/stores/disfluency_patterns.json', JSON.stringify(result, null, 2))
