import type { DisfluencyPattern } from '@/types/disfluency-pattern'



export default function useDisfluencyPattern(text: string, rules: DisfluencyPattern[]): string {
  return rules.reduce((acc, { regex, className }) =>
    acc.replace(new RegExp(regex, 'gi'), `<span class='disfluency ${className.map(cat => cat.toLowerCase().replace(' ', '-')).join(' ')}' title='${className.join(", ")}'>$1</span>`),
    text
  )
}
