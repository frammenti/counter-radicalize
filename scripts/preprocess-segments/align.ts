import { wordsInWindow, groupWindows, flattenWindows, insertPlaceholder } from './utils.ts'
import { DisfluencyType } from '../../src/types/segment.ts'
import type { EmotionSegment, FluencySegment, AlignedSegment } from '../../src/types/segment.ts'
import { toIndex } from '../../src/types/segment.ts'
import type { Alignment, AlignedWord, AlignedWindow, DisfluencyPattern } from '../../src/types/alignment.ts'

export default function align(
  segments: EmotionSegment[],
  windows: FluencySegment[],
  alignment: Alignment
): AlignedSegment[] {
  const alignedWords = alignment.tiers.words.entries.filter(
    ([, , word]) => word !== '<eps>' && word !== '<unk>'
  )

  // Pre-index words
  const wordIndex = new Map<AlignedWord, number>()
  alignedWords.forEach((w, i) => wordIndex.set(w, i))

  const alignedWindows: AlignedWindow[] = []
  for (const win of windows) {
    const words = wordsInWindow(alignedWords, win.start, win.end)
    if (
      words.length > 0 &&
      // Don't display disfluency types of higher fluency windows
      win.fluency < 0.5 &&
      win.disfluency_type.length > 0
    ) {
      alignedWindows.push({
        words,
        disfluencies: toIndex(win.disfluency_type)
      })
    }
  }

  const groupedWindows = groupWindows(alignedWindows, wordIndex)
  const flatWindows = flattenWindows(groupedWindows, alignedWords)

  let total = 0
  let counter = 0

  const aligned: AlignedSegment[] = segments.map(
    ({ start, end, emotions, dimensions, text }) => {
      const segWords = flatWindows.filter(
        win =>
          // Include any window that starts or ends in the segment
          win.words[win.words.length - 1][0] >= start &&
          win.words[0][1] <= end
      )

      const segPatterns: DisfluencyPattern[] = segWords.map(win => {
        const words = win.words.map(w => w[2])
        const firstWord = win.words[0]
        const lastWord = win.words[win.words.length - 1]

        const firstIdx = wordIndex.get(firstWord)!
        const lastIdx = wordIndex.get(lastWord)!

        const prevWord = firstIdx > 0 ? alignedWords[firstIdx - 1] : null
        const nextWord =
          lastIdx + 1 < alignedWords.length ? alignedWords[lastIdx + 1] : null

        let pattern = `(${words.join('\\b[\\W\\d]*')}\\b)`
        if (prevWord && prevWord[0] - 0.7 > start) {
          pattern = `(?:${prevWord[2]})[\\W\\d]*` + pattern
        }
        if (nextWord && nextWord[1] + 0.7 < end) {
          pattern += `(?:[\\W\\d]*${nextWord[2]})`
        }

        return {
          regex: new RegExp(pattern, 'id'),
          classes: win.disfluencies,
        }
      })

      // Sort patterns by number of words
      segPatterns.sort((a, b) => b.regex.source.length - a.regex.source.length)
      total += segPatterns.length

      const [disfluencyText, missed] = insertPlaceholder(text, segPatterns)
      counter += missed

      const segWindows = windows.filter(win => 
        (win.start >= start && win.start <= end) ||
        (win.end >= start && win.end <= end)
      )
      const fluency = segWindows.reduce((acc, curr) => acc += curr.fluency, 0) / segWindows.length

      return {
        start,
        end,
        emotions,
        dimensions,
        fluency,
        text,
        disfluencyText: disfluencyText + ' ',
      }
    }
  )

  process.stdout.write(
    `Missed \x1b[33m${counter}\x1b[0m of ${total} disfluency patterns.\n\n`
  )
  return aligned
}
