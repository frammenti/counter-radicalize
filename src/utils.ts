export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export function capitalize<S extends string>(s: S): Capitalize<S> {
    return s[0].toUpperCase() + s.slice(1) as Capitalize<S>
}

export function round(v: number, per: number = 100, digits: number = 2) {
  let base = 10 ** digits
  return Math.round(v * base * per) / base
}

export function range(start: number, stop: number, step: number) {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  )
}

export function formatTime(s: number, displaySeconds: boolean = true): string {
  const totalSeconds = Math.round(s)
  const minutes = Math.floor(totalSeconds / 60)
  if (displaySeconds === false) return minutes.toString()
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function fromNestedEntries(entries: [string, any][], sep: string = '_'): Record<string, any> {
  const fn = (
    obj: Record<string, any>,
    [key, value]: [string, any],
    sep: string
  ): Record<string, any> => {
    const keys = key.split(sep)
    const last = keys.pop()
    keys.reduce((o, k) => o[k] ??= {}, obj)[last!] = value
    return obj
  }
  return entries.reduce((acc, curr) => fn(acc, curr, sep), {})
}

export function sortMask<T>(arr: T[], compareFn: (a: T, b: T) => number): number[] {
  const indexed = arr
    .map((value, index) => ({ value, index }))
    .sort((a, b) => compareFn(a.value, b.value))

  // Sort the original array in place
  for (let i = 0; i < arr.length; i++) {
    arr[i] = indexed[i].value
  }
  return indexed.map(item => item.index)
}

export function applyMask<T>(arr: T[], mask: number[]): T[] {
  return mask.map(i => arr[i])
}

type Key = string | number | symbol
export class BiMap<T extends Record<Key, Key>> {
  readonly map: T
  readonly reverseMap: { [V in T[keyof T]]: keyof T }

  constructor(map: T) {
    this.map = map
    this.reverseMap = Object.fromEntries(
      Object.entries(map).map(([k, v]) => [v, k])
    ) as { [V in T[keyof T]]: keyof T }
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.map[key]
  }

  revGet<V extends T[keyof T]>(value: V): keyof T {
    return this.reverseMap[value]
  }
}
