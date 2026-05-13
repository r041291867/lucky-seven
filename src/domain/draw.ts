/** Pure draw / pool semantics (RNG injected for testability) */
export type RNG = () => number

/** Fractional part in [0,1) — works for typical `Math.random` or custom RNGs */
export function clampUnitRandom(rng: RNG): number {
  const x = rng()
  return x - Math.floor(x)
}

/** Inclusive integers; RNG default `Math.random` keeps call sites simple */
export function randomIntInclusive(
  min: number,
  max: number,
  rng: RNG = Math.random,
): number {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  if (hi < lo) return lo
  return Math.floor(clampUnitRandom(rng) * (hi - lo + 1)) + lo
}

export function removeAt<T>(
  xs: readonly T[],
  index: number,
): readonly T[] {
  if (index < 0 || index >= xs.length) return xs
  return [...xs.slice(0, index), ...xs.slice(index + 1)]
}

/** Prepend and cap history immutably */
export function prependCapped<T>(
  items: readonly T[],
  head: T,
  cap: number,
): readonly T[] {
  return [head, ...items].slice(0, Math.max(0, cap))
}

export type PreparedRollNone = { readonly tag: 'none' }
export type PreparedRollReady = {
  readonly tag: 'ready'
  readonly target: number
  /** When noRepeat: remaining pool copy; otherwise null */
  readonly nextPoolSnapshot: readonly number[] | null
}
export type PreparedRoll = PreparedRollNone | PreparedRollReady

export type PrepareRollDeps = Readonly<{
  boundsOk: boolean
  rangeCount: number
  isRolling: boolean
  noRepeat: boolean
  pool: readonly number[] | null
  range: readonly number[]
  lo: number
  hi: number
}>

export function prepareRoll(
  deps: PrepareRollDeps,
  rng: RNG = Math.random,
): PreparedRoll {
  const {
    boundsOk,
    rangeCount,
    isRolling,
    noRepeat,
    pool,
    range,
    lo,
    hi,
  } = deps
  if (!boundsOk || rangeCount < 1 || isRolling) return { tag: 'none' }

  if (!noRepeat) {
    const target = randomIntInclusive(lo, hi, rng)
    return { tag: 'ready', target, nextPoolSnapshot: null }
  }

  const current = pool ?? [...range]
  if (current.length === 0) return { tag: 'none' }
  const pickIndex = Math.floor(clampUnitRandom(rng) * current.length)
  const target = current[pickIndex]
  const nextPool = removeAt(current, pickIndex)
  return { tag: 'ready', target, nextPoolSnapshot: nextPool }
}

export function poolBlocksRoll(
  noRepeat: boolean,
  pool: readonly number[] | null,
): boolean {
  return noRepeat && (pool?.length ?? 0) === 0
}

export function canRollAttempt(deps: Readonly<{
  boundsOk: boolean
  rangeCount: number
  isRolling: boolean
  noRepeat: boolean
  pool: readonly number[] | null
}>): boolean {
  return (
    deps.boundsOk &&
    deps.rangeCount >= 1 &&
    !deps.isRolling &&
    !poolBlocksRoll(deps.noRepeat, deps.pool)
  )
}
