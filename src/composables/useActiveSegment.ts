import { ref, watch } from 'vue'
import { playtime } from '@/stores/state'
import type { Segment } from '@/types/segment'


export default function useActiveSegment(segments: Segment[]) {
  const active = ref<number>(-1)
  const lastIdx = segments.length - 1
  const secondStart = segments[1].start
  const lastStart = segments[lastIdx - 1].end

  function findActiveSegment(t: number, ot: number): number {
    if (t < secondStart) return 0
    if (t >= lastStart) return lastIdx

    const idx = active.value
    if (idx >= 0) {
      const curr = segments[idx], next = segments[idx + 1], prev = segments[idx - 1]
      if (t >= curr.start && t < next.start) return idx
      if (t >= curr.end && t < next.end) return idx + 1
      if (t < curr.start && t >= prev.start) return idx - 1

      return binarySearch(
        t,
        segments,
        atMoment,
        t > ot ? idx + 1 : 0,
        t > ot ? lastIdx : idx - 1
      )
    }
    return binarySearch(t, segments, atMoment)
  }

  watch(playtime, (n, o) => active.value = findActiveSegment(n, o))

  return active
}

/*
In binary search the compare function is looking for
the correct index where to insert the el in the array,
so here time (as a virtual segment) is the "a" parameter
of the function.
*/
function atMoment(t: number, seg: Segment): number {
  // backward: time is before the start of the segment
  if (t < seg.start) return -1
  // forward: time is after the end of the segment
  if (t >= seg.end) return 1
  return 0
}

function binarySearch<A, B>(el: A, arr: B[], compareFn: (a: A, b: B) => number, lo = 0, hi = arr.length - 1): number {
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    var comp = compareFn(el, arr[mid])
    if (comp > 0) {
      lo = mid + 1
    } else if (comp < 0) {
      hi = mid - 1
    } else {
      return mid
    }
  }
  return lo - 1
}
