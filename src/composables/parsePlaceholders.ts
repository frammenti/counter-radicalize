import { DisfluencyType, type Disfluency } from '@/types/fluency-segment'

export type Token =
  | string
  | { content: Token[], class: string, desc: Disfluency[] }

export default function parsePlaceholders(text: string): Token[] {
  const delims = /\$\d+|\$/g
  const left   = /\$(\d+)/
  const result: Token[] = []

  let level = 0
  let start = 0
  let match: RegExpExecArray | null
  let disfluencies: Disfluency[] = []

  while ((match = delims.exec(text))) {
    if (left.test(match[0])) {
      if (level++ == 0) {
        const before = text.slice(start, match.index)
        if (before) result.push(before)
        disfluencies = left.exec(match[0])![1]
                           .split('')
                           .map(d => DisfluencyType[parseInt(d, 10)])
                           .filter(Boolean)
        start = delims.lastIndex
      }
    } else if (level > 0) {
      if (--level == 0) {
        result.push({
          content: parsePlaceholders(text.slice(start, match.index)),
          class: disfluencies.map(d => d.toLowerCase().replace(/\s+/g, '-'))
                             .join(' '),
          desc: disfluencies
        })
        start = delims.lastIndex
      }
    }
  }
  const after = text.slice(start)
  if (after) result.push(after)
  return result
}
