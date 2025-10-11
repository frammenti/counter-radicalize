function partition<T>(array: T[], condition: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [], fail: T[] = [];
  array.forEach((e) => (condition(e) ? pass : fail).push(e));
  return [pass, fail];
}

export default function usePartition(
  data: Record<string, number>,
  threshold: number = 0.095) {
const items = Object.entries(data).sort((a, b) => b[1] - a[1])
  return partition(items, e => e[1] >= threshold)
}
