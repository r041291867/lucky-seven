/** Pure: parse numeric bounds from UI strings */
export type ParsedBounds =
  | { readonly ok: false; readonly start: number; readonly end: number }
  | { readonly ok: true; readonly start: number; readonly end: number }

export function parseBounds(startStr: string, endStr: string): ParsedBounds {
  const start = Number(startStr)
  const end = Number(endStr)
  return Number.isFinite(start) && Number.isFinite(end)
    ? ({ ok: true, start, end } as const)
    : ({ ok: false, start: 0, end: 0 } as const)
}

/** Monotonic integers from min(a,b) to max(a,b), inclusive — immutable output */
export function buildInclusiveOrderedRange(a: number, b: number): readonly number[] {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  const len = hi - lo + 1
  return Array.from({ length: len }, (_, i) => lo + i)
}

export function boundsToRange(bounds: ParsedBounds): readonly number[] {
  return bounds.ok ? [...buildInclusiveOrderedRange(bounds.start, bounds.end)] : []
}
