import { computed, toRef, toValue } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { clamp } from '@/utils'

// Types
type Point = [x: number, y: number]

interface PieSegmentProps {
  gap?: number | string
  hoverScale?: number | string
  innerCut?: number | string
  rounded?: number | string
  value: number
}

// Base functions
function pointOnArc (center: Point, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180.0
  return [center[0] + radius * Math.cos(radians), center[1] + radius * Math.sin(radians)]
}

function drawCircle ([x, y]: Point, r: number, width: number) {
  const innerRadius = r - width
  return [
    'M', x - r, y,
    'A', r, r, 0, 1, 0, x + r, y,
    'A', r, r, 0, 1, 0, x - r, y,
    'M', x - innerRadius, y,
    'A', innerRadius, innerRadius, 0, 1, 0, x + innerRadius, y,
    'A', innerRadius, innerRadius, 0, 1, 0, x - innerRadius, y,
    'Z',
  ]
}

export function simpleArc (center: Point, r: number, startAngle: number, endAngle: number) {
  const start = pointOnArc(center, r, startAngle)
  const end = pointOnArc(center, r, endAngle)
  const sweep = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M${start[0]} ${start[1]}`,
    `A${r} ${r} 0 ${sweep} 1 ${end[0]} ${end[1]}`,
    `L${center[0]} ${center[1]}Z`,
  ]
    .join(' ')
}

export function roundedArc (center: Point, radius: number, startAngle: number, endAngle: number, width: number, rounding: number): string {
  width = Math.min(radius, width)

  if (Math.abs(endAngle - startAngle) === 360) {
    return drawCircle(center, radius, width).join(' ')
  }

  if (rounding === 0 && radius === width) {
    return simpleArc(center, radius, startAngle, endAngle)
  }

  const innerR = radius - width
  const circumference = Math.abs(endAngle - startAngle)
  rounding = Math.min(width / 2, rounding)

  if (360 * (rounding / (Math.PI * (radius - width))) > Math.abs(startAngle - endAngle)) {
    rounding = circumference / 360 * innerR * Math.PI
  }

  // inner and outer radiuses
  const innerR2 = innerR + rounding
  const outerRadius = radius - rounding

  // butts corner points
  const oStart = pointOnArc(center, outerRadius, startAngle)
  const oEnd = pointOnArc(center, outerRadius, endAngle)

  const iStart = pointOnArc(center, innerR2, startAngle)
  const iEnd = pointOnArc(center, innerR2, endAngle)

  const iSection = innerR ? 360 * (rounding / (2 * Math.PI * innerR)) : 0
  const oSection = 360 * (rounding / (2 * Math.PI * radius))

  // arcs endpoints
  const iArcStart = pointOnArc(center, innerR, startAngle + iSection)
  const iArcEnd = pointOnArc(center, innerR, endAngle - iSection)

  const oArcStart = pointOnArc(center, radius, startAngle + oSection)
  const oArcEnd = pointOnArc(center, radius, endAngle - oSection)

  const arcSweep1 = circumference > 180 + 2 * oSection ? 1 : 0
  const arcSweep2 = circumference > 180 + 2 * iSection ? 1 : 0

  return [
    // begin path
    'M', oStart[0], oStart[1],
    // outer start corner
    'A', rounding, rounding, 0, 0, 1, oArcStart[0], oArcStart[1],
    // outer main arc
    'A', radius, radius, 0, arcSweep1, 1, oArcEnd[0], oArcEnd[1],
    // outer end corner
    'A', rounding, rounding, 0, 0, 1, oEnd[0], oEnd[1],
    // end butt
    'L', iEnd[0], iEnd[1],
    // inner end corner
    'A', rounding, rounding, 0, 0, 1, iArcEnd[0], iArcEnd[1],
    // inner arc
    'A', innerR, innerR, 0, arcSweep2, 0, iArcStart[0], iArcStart[1],
    // inner start corner
    'A', rounding, rounding, 0, 0, 1, iStart[0], iStart[1], 'Z', // end path
  ]
    .join(' ')
}

export function usePieArc (props: PieSegmentProps, isHovering: Ref<boolean>) {
  const hoverZoomRatio = toRef(() => clamp(Number(props.hoverScale ?? 0), 0, 0.25))
  const normalizedValue = toRef(() => clamp(props.value - 100 * Number(props.gap ?? 0) / 360, 0.2, 99.99))
  const normalizedInnerCut = toRef(() => {
    const min = Number(props.rounded ?? 0) > 0 ? 0.2 : 0
    return clamp(Number(props.innerCut ?? 0) / 100, min, 1)
  })

  const radians = computed(() => (360 * (-normalizedValue.value / 100) + 90) * (Math.PI / 180))
  const arcWidth = computed(() => 50 * (1 - normalizedInnerCut.value) * (isHovering.value ? 1 : (1 - hoverZoomRatio.value)))

  const outerX = toRef(() => 50 + 50 * Math.cos(radians.value))
  const outerY = toRef(() => 50 - 50 * Math.sin(radians.value))

  return {
    hoverZoomRatio,
    normalizedValue,
    normalizedInnerCut,
    outerX,
    outerY,
    arcWidth,
  }
}

export function useOuterSlicePath ({
  angle,
  radius,
  size,
  width,
  rounded,
}: {
  angle: MaybeRefOrGetter<number>
  radius: MaybeRefOrGetter<number>
  size: MaybeRefOrGetter<number>
  width: MaybeRefOrGetter<number>
  rounded: MaybeRefOrGetter<number>
}) {
  return computed(() =>
    roundedArc(
      [50, 50],
      toValue(radius),
      toValue(angle),
      toValue(angle) + 360 * toValue(size) / 100, // angle end,
      toValue(width),
      toValue(rounded),
    )
  )
}

export function useInnerSlicePath ({
  angle,
  radius,
  size,
}: {
  angle: MaybeRefOrGetter<number>
  radius: MaybeRefOrGetter<number>
  size: MaybeRefOrGetter<number>
}) {
  return computed(() =>
    simpleArc(
      [50, 50],
      toValue(radius),
      toValue(angle),
      toValue(angle) + 360 * toValue(size) / 100, // angle end,
    )
  )
}