import type { FluencySegment } from '../../src/types/segment.ts'

export default function discretize(windows: FluencySegment[]) {
  return windows.map(win => { return { time: win.start, fluency: win.fluency }})
}
