import type { PlotOptions, Data, RenderableMark, CompoundMark, MarkOptions, PointerOptions, Rendered, TransformFunction, InitializerFunction, RenderFunction } from '@observablehq/plot'

type PlotModule = typeof import('@observablehq/plot')

export type MarkKey = {
  [K in keyof PlotModule]:
    PlotModule[K] extends (data: Data, options: MarkOptions) =>
    RenderableMark | CompoundMark
      ? K
      : never
}[keyof PlotModule]

export type TransformKey = {
  [K in keyof PlotModule]:
    PlotModule[K] extends <T>(options: T & PointerOptions) =>
    Rendered<T>
      ? K
      : never
}[keyof PlotModule]

type GetOptions<F> = F extends (options?: number | infer O) => any
  ? O
  : F extends (data?: Data, options?: infer O) => any
  ? O
  : F extends (options?: infer O) => any
  ? O
  : PointerOptions

export type Options = { [K in MarkKey] : GetOptions<PlotModule[K]> }
type TransformOptions = { [T in TransformKey] : GetOptions<PlotModule[T]> }

export type AsyncMark = {
  [K in MarkKey]: {
    type: K
    data?: Data
    options?: Options[K] | AsyncTransform<K>
  }
}[MarkKey]

export type AsyncTransform<K extends MarkKey> = {
  [T in TransformKey]: {
    type: T
    options: Options[K] & TransformOptions[T]
  }
}[TransformKey]

export interface Gradient {
  id: string
  min: number
  max: number
  low: string
  high: string
}

export type MarkConstructor<K extends MarkKey> = (data?: Data, options?: Options[K]) => ReturnType<PlotModule[K]>

export type TransformConstructor<T extends TransformKey> = <K extends MarkKey>(options?: Options[K] & PointerOptions) => ReturnType<PlotModule[T]>

export interface AsyncPlotOptions extends Omit<PlotOptions, 'marks'> {
  marks?: (AsyncMark | RenderableMark | CompoundMark | RenderFunction | { transform: TransformFunction } | { initializer: InitializerFunction })[]
}
