/** Clamp any raw component score into the [0, 1] range every formula in the spec requires. */
export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function weightedSum(pairs: Array<[value: number, weight: number]>): number {
  return pairs.reduce((sum, [value, weight]) => sum + clamp01(value) * weight, 0)
}
