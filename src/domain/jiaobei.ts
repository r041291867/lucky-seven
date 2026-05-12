import { clampUnitRandom, type RNG } from './draw'

export type JiaobeiFace = 'yin' | 'yang'
export type JiaobeiOutcome = 'sheng' | 'xiao' | 'yin'

export type JiaobeiThrow = Readonly<{
  left: JiaobeiFace
  right: JiaobeiFace
  outcome: JiaobeiOutcome
}>

export function randomFace(rng: RNG = Math.random): JiaobeiFace {
  return clampUnitRandom(rng) < 0.5 ? 'yin' : 'yang'
}

export function classifyOutcome(
  left: JiaobeiFace,
  right: JiaobeiFace,
): JiaobeiOutcome {
  if (left !== right) return 'sheng'
  return left === 'yang' ? 'xiao' : 'yin'
}

export function throwJiaobei(rng: RNG = Math.random): JiaobeiThrow {
  const left = randomFace(rng)
  const right = randomFace(rng)
  return { left, right, outcome: classifyOutcome(left, right) }
}

export function outcomeLabel(outcome: JiaobeiOutcome): string {
  if (outcome === 'sheng') return '聖筊'
  if (outcome === 'xiao') return '笑筊'
  return '陰筊'
}
