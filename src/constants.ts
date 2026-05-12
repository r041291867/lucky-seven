export const WHEEL_MAX = 60
export const HISTORY_CAP = 200
export const ANIM_NUMBER_MS = 1600
export const ANIM_WHEEL_MS = 2200
/** CSS transition duration for wheel rotor (approx. match ANIM_WHEEL_MS) */
export const WHEEL_TRANSITION = 'transform 2.35s cubic-bezier(0.15, 0, 0.15, 1)'

export const PRESETS = [
  { label: '1–20', start: 1, end: 20 },
  { label: '1–50', start: 1, end: 50 },
  { label: '1–100', start: 1, end: 100 },
  { label: '1–2000', start: 1, end: 2000 },
] as const
