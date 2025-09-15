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

function groupWindows(arr: AlignedWindow[]): AlignedWindow[] {
  const results: AlignedWindow[] = []
  let active = new Map<Disfluency, AlignedWindow>()

  for (let { words, disfluencies } of arr) {
    const current = new Set(disfluencies)

    // Close groups that are missing in this window
    for (const key of active.keys()) {
      if (!current.has(key)) {
        const group = active.get(key)!
        if (group.words.length > 0) results.push(group)
        active.delete(key)
      }
    }

    // Partition disfluencies
    const existing: Disfluency[] = []
    const fresh: Disfluency[] = []

    for (const d of disfluencies) {
      (active.has(d)) ?
      existing.push(d)
      : fresh.push(d)
    }

    // 1. Handle existing disfluencies
    for (const d of existing) {
      const group = active.get(d)!
      const sharedWords = group.words.filter(w => words.includes(w))

      if (sharedWords.length > 0) {
        // Intersect words
        group.words = sharedWords
      } else {
        // No overlap: close old group, start fresh
        if (group.words.length > 0) results.push(group)
        active.set(d, { words: words, disfluencies: [d] })
      }
    }

    // 2. Handle new disfluencies with whatever words are left
    for (const d of fresh) {
      active.set(d, { words: words, disfluencies: [d] })
    }
  }

  // Flush remaining groups
  results.push(...active.values())

  // Concat disfluencies if words are the same
  return results.reduce((acc: AlignedWindow[], curr: AlignedWindow) => {
    const sameWords = acc.find(win => win.words == curr.words)
    sameWords ?
    sameWords.disfluencies = sameWords.disfluencies.concat(curr.disfluencies)
    : acc.push(curr)
    return acc
  }, [])
}

const segments = segmentData as EmotionSegment[]
const windows = fluencyData as FluencySegment[]
const alignment = alignmentData as Alignment
const alignedWords = alignment.tiers.words.entries.filter(([start, end, word]) => word != '<eps>' && word != '<unk>')

const alignedWindows: AlignedWindow[] = []
for (const win of windows) {
  const words = alignedWords.filter(([start, end, word]) => start > win.start && end < win.end)
  // Don't display disfluency types of higher fluency windows
  const disfluencies = win.fluency < 0.5 ? win.disfluency_type : []
  if (words.length > 0 && disfluencies.length > 0) alignedWindows.push(
    { words: words, disfluencies: disfluencies }
  )
}

const groupedWindows = groupWindows(alignedWindows)

const result: DisfluencyPattern[][] = segments.map(({ start, end }) => {
  const disfluencies = groupedWindows.filter(win => win.words[0][0] > start && win.words[0][1] < end)
  const segPatterns: DisfluencyPattern[] = []
  for (const dis of disfluencies) {
    const words = dis.words.map(w => w[2])
    const previousWordIndex = alignedWords.findIndex(w => w == dis.words[0]) - 1
    const previousWord = previousWordIndex >= 0 ? alignedWords[previousWordIndex][2] : '^'
    segPatterns.push({
      regex: `(\\b${words.join('\\b\\W*\\b')}\\b)`,
      className: dis.disfluencies
  })
  }
  return segPatterns
})

fs.writeFileSync('./src/stores/disfluency_patterns.json', JSON.stringify(result, null, 2))
