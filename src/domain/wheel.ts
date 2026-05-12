/** Pure SVG wheel geometry */

export type WheelSliceView = Readonly<{
  num: number
  path: string
  mid: number
  tx: number
  ty: number
  fill: string
  fontSize: number
}>

export function polar(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Readonly<{ x: number; y: number }> {
  const rad = (angleDeg * Math.PI) / 180
  return Object.freeze({
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  })
}

/** Pie slice from center (0,0); segment i starts at top (-90°), clockwise */
export function wheelSlicePath(i: number, n: number, radius: number): string {
  const R = radius
  if (n === 1) {
    return `M 0 0 L ${R} 0 A ${R} ${R} 0 1 1 ${-R} 0 A ${R} ${R} 0 1 1 ${R} 0 Z`
  }
  const seg = 360 / n
  const a0 = -90 + i * seg
  const a1 = -90 + (i + 1) * seg
  const p0 = polar(0, 0, R, a0)
  const p1 = polar(0, 0, R, a1)
  const largeArc = seg > 180 ? 1 : 0
  return `M 0 0 L ${p0.x} ${p0.y} A ${R} ${R} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`
}

/** Delta to add to current CSS rotation degrees so segment `targetIndex` sits under pointer */
export function wheelRotationIncrementDegrees(
  targetIndex: number,
  segmentCount: number,
  fullRotations = 8,
): number {
  const n = segmentCount
  const segment = 360 / n
  const mid = -90 + targetIndex * segment + segment / 2
  const align = -90 - mid
  return 360 * fullRotations + align
}

const COLORS = ['#383840', '#2c2c34'] as const

/** Build drawable slice descriptors for SVG (pure) */
export function buildWheelSlices(
  rangeOrdered: readonly number[],
): readonly WheelSliceView[] {
  const n = rangeOrdered.length
  if (n === 0) return []
  const R = 48
  const labelR = n === 1 ? 0 : R * 0.84
  const maxDigits = Math.max(...rangeOrdered.map((v) => String(v).length))
  const fontSize = Math.max(
    4,
    Math.min(11, 220 / (n * Math.max(maxDigits, 1) * 0.42)),
  )
  const seg = 360 / n

  return rangeOrdered.map((num, i) => {
    const mid = -90 + i * seg + seg / 2
    const tp =
      n === 1 ? ({ x: 0, y: -26 } as const) : polar(0, 0, labelR, mid)
    return Object.freeze({
      num,
      path: wheelSlicePath(i, n, R),
      mid,
      tx: tp.x,
      ty: tp.y,
      fill: COLORS[i % 2],
      fontSize,
    })
  })
}
