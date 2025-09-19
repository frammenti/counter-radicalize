import segmentData from '../../models/outputs/segments_emotion.json' with { type: 'json' }
import fluencyData from '../../models/outputs/segments_fluency.json' with { type: 'json' }
import alignmentData from '../../models/outputs/alignment.json' with { type: 'json' }

import type { EmotionSegment } from '../../src/types/emotion-segment'
import type { FluencySegment } from '../../src/types/fluency-segment'
import type { Alignment } from '../../src/types/alignment'

export default function loadData() {
  return {
    segments: segmentData as EmotionSegment[],
    windows: fluencyData as FluencySegment[],
    alignment: alignmentData as Alignment,
  }
}
