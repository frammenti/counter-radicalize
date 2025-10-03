import type { AlignedWord } from '../../src/types/alignment.ts'
import type { AlignedWindow, DisfluencyPattern } from '../../src/types/alignment.ts'

export function wordsInWindow(
  words: AlignedWord[],
  winStart: number,
  winEnd: number
): AlignedWord[] {
  // Binary search for the first word starting after the window start
  let lo = 0, hi = words.length - 1, idx = words.length
  while (lo <= hi) {
    // Bitwise right shift, equivalent to floor division by 2
    const mid = (lo + hi) >> 1
    if (words[mid][0] >= winStart) {
      idx = mid
      hi = mid - 1
    } else {
      lo = mid + 1
    }
  }

  const result: AlignedWord[] = []
  for (let i = idx; i < words.length && words[i][0] <= winEnd; i++) {
    const end = words[i][1]
    if (end <= winEnd) result.push(words[i])
  }
  return result
}

export function groupWindows(arr: AlignedWindow[], wordIndex: Map<AlignedWord, number>): AlignedWindow[] {
  const result: AlignedWindow[] = []
  const active = new Map<number, AlignedWindow>()

  for (const { words, disfluencies } of arr) {
    const indices = words.map(w => wordIndex.get(w)!)
    const current = new Set(disfluencies)

    // Close inactive groups
    for (const d of [...active.keys()]) {
      if (!current.has(d)) {
        result.push(active.get(d)!)
        active.delete(d)
      }
    }

    // Update existing or start fresh
    for (const d of disfluencies) {
      if (active.has(d)) {
        const group = active.get(d)!
        const groupStart = wordIndex.get(group.words[0])!
        const groupEnd = wordIndex.get(group.words[group.words.length - 1])!
        const start = indices[0], end = indices[indices.length - 1]

        if (start > groupEnd || end < groupStart) {
          // No overlap: start new group
          result.push(group)
          active.set(d, { words, disfluencies: [d] })
        } else {
          // Overlap: intersect
          const newStart = Math.max(groupStart, start)
          const newEnd = Math.min(groupEnd, end)
          group.words = words.slice(newStart - start, newEnd - start + 1)
        }
      } else {
        active.set(d, { words, disfluencies: [d] })
      }
    }
  }

  result.push(...active.values())
  return result
}

export function flattenWindows(
  windows: AlignedWindow[],
  words: AlignedWord[]
): AlignedWindow[] {
  const map = new Map<AlignedWord, Set<number>>()
  // Populate map
  for (const win of windows) {
    for (const w of win.words) {
      const existing = map.get(w)
      if (existing) {
        for (const d of win.disfluencies) existing.add(d)
      } else {
        map.set(w, new Set(win.disfluencies))
      }
    }
  }

  const result: AlignedWindow[] = []
  let active: AlignedWindow | null = null
  let current: string | null = null

  for (const w of words) {
    const disfluencies = [...(map.get(w) ?? [])].sort()
    const key = disfluencies.join('|')

    if (active && key == current) {
      active.words.push(w)
    } else {
      active = { words: [w], disfluencies }
      current = key
      if (disfluencies.length > 0) result.push(active)
    }
  }

  return result
}

export function insertPlaceholder(text: string, rules: DisfluencyPattern[]): [string, number] {
  let missed: number = 0
  return [rules.reduce((acc, { regex, classes }) => {
      const match = regex.exec(acc)
      if (match) {
        const [start, end] = match.indices![1]
        return acc.slice(0, start) + `$${classes.join('')}` + acc.slice(start, end) + `$` + acc.slice(end)
      } else {
        missed++
        return acc
      }
    },
    text
  ), missed]
}
