import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  ANIM_NUMBER_MS,
  ANIM_WHEEL_MS,
  HISTORY_CAP,
  PRESETS,
  WHEEL_MAX,
  WHEEL_TRANSITION,
} from './constants'
import {
  canRollAttempt,
  poolBlocksRoll,
  prepareRoll,
  prependCapped,
  randomIntInclusive,
  wheelTargetIndex,
} from './domain/draw'
import { boundsToRange, parseBounds } from './domain/range'
import { buildWheelSlices, wheelRotationIncrementDegrees } from './domain/wheel'
import { createAudioRuntime, type AudioRuntime } from './sound'

type Mode = 'number' | 'wheel'

function useStableAudio(): AudioRuntime {
  return useMemo(createAudioRuntime, [])
}

export default function App() {
  const audio = useStableAudio()
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [startStr, setStartStr] = useState('1')
  const [endStr, setEndStr] = useState('2000')
  const [mode, setMode] = useState<Mode>('number')
  const [noRepeat, setNoRepeat] = useState(false)
  const [pool, setPool] = useState<readonly number[] | null>(null)
  const [history, setHistory] = useState<readonly number[]>([])
  const [display, setDisplay] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [wheelDeg, setWheelDeg] = useState(0)

  const bounds = useMemo(() => parseBounds(startStr, endStr), [startStr, endStr])
  const range = useMemo(() => boundsToRange(bounds), [bounds])
  const rangeCount = range.length
  const wheelOk = rangeCount >= 1 && rangeCount <= WHEEL_MAX
  const lo = range[0] ?? 0
  const hi = range[rangeCount - 1] ?? 0

  useEffect(() => {
    if (mode === 'wheel' && !wheelOk) {
      setMode('number')
    }
  }, [mode, wheelOk])

  useEffect(() => {
    if (!noRepeat && pool !== null) {
      setPool(null)
    }
  }, [noRepeat, pool])

  useEffect(() => {
    if (!noRepeat) return
    setPool([...range])
  }, [noRepeat, bounds.ok, lo, hi, rangeCount, range])

  const stopTickTimers = useCallback((): void => {
    if (tickTimerRef.current !== null) {
      clearInterval(tickTimerRef.current)
      tickTimerRef.current = null
    }
  }, [])

  useEffect(() => () => stopTickTimers(), [stopTickTimers])

  const finishRoll = useCallback(
    (target: number): void => {
      setDisplay(target)
      audio.playRevealSound(soundOn)
      setHistory((h) => prependCapped(h, target, HISTORY_CAP))
      setIsRolling(false)
    },
    [audio, soundOn],
  )

  const runNumberReveal = useCallback(
    (target: number, durationMs: number): void => {
      const tickSoundId = window.setInterval(
        () => audio.playRollTick(soundOn),
        95,
      )
      tickTimerRef.current = tickSoundId

      const shuffleDisplay = window.setInterval(() => {
        setDisplay(() => randomIntInclusive(lo, hi))
      }, 48)

      window.setTimeout(() => {
        stopTickTimers()
        window.clearInterval(shuffleDisplay)
        finishRoll(target)
      }, durationMs)
    },
    [audio, finishRoll, hi, lo, soundOn, stopTickTimers],
  )

  const runWheelReveal = useCallback(
    (
      target: number,
      durationMs: number,
      meta: Readonly<{ n: number; idx: number }>,
    ): void => {
      if (meta.idx < 0) {
        setIsRolling(false)
        return
      }

      const tickSoundId = window.setInterval(
        () => audio.playRollTick(soundOn),
        110,
      )
      tickTimerRef.current = tickSoundId

      const shuffleDisplay = window.setInterval(() => {
        setDisplay(() => randomIntInclusive(lo, hi))
      }, 72)

      const deltaDeg = wheelRotationIncrementDegrees(meta.idx, meta.n, 8)
      setWheelDeg((prev) => prev + deltaDeg)

      window.setTimeout(() => {
        stopTickTimers()
        window.clearInterval(shuffleDisplay)
        finishRoll(target)
      }, durationMs + 80)
    },
    [audio, finishRoll, hi, lo, soundOn, stopTickTimers],
  )

  const performRoll = useCallback(() => {
    const prepared = prepareRoll({
      boundsOk: bounds.ok,
      rangeCount,
      isRolling,
      noRepeat,
      pool,
      range,
      lo,
      hi,
    })

    if (prepared.tag !== 'ready') return

    const { target, nextPoolSnapshot } = prepared

    setIsRolling(true)
    if (noRepeat && nextPoolSnapshot !== null) {
      setPool(nextPoolSnapshot)
    }

    if (mode === 'wheel' && wheelOk) {
      const idx = wheelTargetIndex(range, target)
      runWheelReveal(target, ANIM_WHEEL_MS, { n: rangeCount, idx })
    } else {
      runNumberReveal(target, ANIM_NUMBER_MS)
    }
  }, [
    bounds.ok,
    isRolling,
    lo,
    hi,
    mode,
    noRepeat,
    pool,
    range,
    rangeCount,
    runNumberReveal,
    runWheelReveal,
    wheelOk,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return
      e.preventDefault()
      performRoll()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [performRoll])

  const resetPool = (): void => {
    if (noRepeat) setPool([...range])
  }

  const copyResult = async (): Promise<void> => {
    if (display === null) return
    try {
      await navigator.clipboard.writeText(String(display))
    } catch {
      /* ignore */
    }
  }

  const clearHistory = (): void => setHistory([])

  const applyPreset = (start: number, end: number): void => {
    setStartStr(String(start))
    setEndStr(String(end))
  }

  const canRoll = canRollAttempt({
    boundsOk: bounds.ok,
    rangeCount,
    isRolling,
    noRepeat,
    pool,
  })

  const poolEmpty = poolBlocksRoll(noRepeat, pool)

  const wheelSlices = useMemo(
    () => (wheelOk ? buildWheelSlices(range) : []),
    [range, wheelOk],
  )

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <span className="brand">LUCKY CHANNEL</span>
          <span className={`status${isRolling ? ' rolling' : ''}`}>
            {isRolling ? 'ROLLING' : 'READY'}
          </span>
        </header>

        <div className="mode-row">
          <button
            type="button"
            className={`mode-btn${mode === 'number' ? ' active' : ''}`}
            onClick={() => setMode('number')}
          >
            數字模式
          </button>
          <button
            type="button"
            className={`mode-btn${mode === 'wheel' ? ' active' : ''}`}
            onClick={() => wheelOk && setMode('wheel')}
            disabled={!wheelOk}
            title={
              !wheelOk
                ? `轉盤模式最多支援 ${WHEEL_MAX} 個數字（目前範圍：${rangeCount}）`
                : undefined
            }
          >
            轉盤模式
          </button>
        </div>
        {!wheelOk && (
          <p className="hint">
            轉盤模式僅支援最多 {WHEEL_MAX} 個數字；請縮小起始／結束範圍後再使用。
          </p>
        )}

        <div className="range-grid">
          <div className="field">
            <label htmlFor="start">起始值</label>
            <input
              id="start"
              type="number"
              inputMode="numeric"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="end">結束值</label>
            <input
              id="end"
              type="number"
              inputMode="numeric"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
            />
          </div>
        </div>

        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="preset"
              onClick={() => applyPreset(p.start, p.end)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {!bounds.ok && (
          <p className="err">請輸入有效的數字範圍。</p>
        )}

        <div className="options">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={noRepeat}
              onChange={(e) => setNoRepeat(e.target.checked)}
            />
            不重複抽取
          </label>
          <button
            type="button"
            className="reset-pool"
            onClick={resetPool}
            disabled={!noRepeat}
          >
            重置抽籤池
          </button>
        </div>

        <section className="result-shell" aria-live="polite">
          <div className="result-label">
            {mode === 'wheel' && wheelOk ? 'WHEEL' : 'RESULT'}
          </div>
          <div className="result-main">
            {mode === 'wheel' && wheelOk ? (
              <div className="wheel-stack">
                <div className="wheel-wrap">
                  <div className="wheel-pointer" aria-hidden />
                  <div className="wheel-disk wheel-disk--svg">
                    <svg
                      className="wheel-svg"
                      viewBox="-50 -50 100 100"
                      aria-hidden
                    >
                      <g
                        className="wheel-rotor"
                        style={{
                          transform: `rotate(${wheelDeg}deg)`,
                          transition: WHEEL_TRANSITION,
                        }}
                      >
                        {wheelSlices.map((s, sliceIdx) => (
                          <g key={`${sliceIdx}-${s.num}`}>
                            <path
                              d={s.path}
                              fill={s.fill}
                              stroke="#1e1e22"
                              strokeWidth={0.45}
                            />
                            <text
                              x={s.tx}
                              y={s.ty}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#fafafa"
                              fontSize={s.fontSize}
                              fontWeight={600}
                              fontFamily="system-ui, sans-serif"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                              transform={
                                rangeCount === 1
                                  ? undefined
                                  : `rotate(${s.mid + 90}, ${s.tx}, ${s.ty})`
                              }
                            >
                              {s.num}
                            </text>
                          </g>
                        ))}
                      </g>
                    </svg>
                  </div>
                  <div className="wheel-center">
                    {display === null ? '?' : display}
                  </div>
                </div>
                <p className="wheel-caption">
                  可視轉盤 {rangeCount} 格
                </p>
              </div>
            ) : (
              <div
                className={`result-number${isRolling ? ' rolling-anim' : ''}`}
              >
                {display === null ? '?' : display}
              </div>
            )}
          </div>
          <p className="result-sub">
            {poolEmpty
              ? '抽籤池已空，請重置或關閉不重複'
              : isRolling
                ? 'Rolling…'
                : 'Press Roll'}
          </p>
        </section>

        <div className="actions">
          <button
            type="button"
            className="btn-roll"
            onClick={performRoll}
            disabled={!canRoll}
          >
            ROLL
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={performRoll}
            disabled={!canRoll}
          >
            Re-roll
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setSoundOn((s) => !s)}
          >
            {soundOn ? 'Sound On' : 'Sound Off'}
          </button>
        </div>

        <div className="history-head">
          <span className="history-title">HISTORY</span>
        </div>
        <div className="history-actions">
          <button type="button" className="btn-secondary" onClick={copyResult}>
            複製結果
          </button>
          <button type="button" className="btn-secondary" onClick={clearHistory}>
            清空紀錄
          </button>
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">尚無紀錄</div>
          ) : (
            history.map((n, i) => (
              <div key={`${n}-${i}`} className="history-item">
                <span>#{history.length - i}</span>
                <span className="history-val">{n}</span>
              </div>
            ))
          )}
        </div>

        <footer className="footer">
          <span>Enter / Space</span>
          <span className="footer-center">
            Range {bounds.ok ? `${lo}–${hi}` : '—'}
          </span>
          <span className="footer-right">Designed by Gomez</span>
        </footer>
      </div>
    </div>
  )
}
