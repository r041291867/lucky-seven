import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ANIM_NUMBER_MS, HISTORY_CAP, PRESETS } from "./constants";
import { canRollAttempt, poolBlocksRoll, prepareRoll, prependCapped, randomIntInclusive } from "./domain/draw";
import { boundsToRange, parseBounds } from "./domain/range";
import { useHistory } from "./HistoryContext";
import type { i18n } from "./i18n";
import { createAudioRuntime, type AudioRuntime } from "./sound";

type I18nDict = (typeof i18n)[keyof typeof i18n];

interface Props {
    soundOn: boolean;
    t: I18nDict;
}

function useStableAudio(): AudioRuntime {
    return useMemo(createAudioRuntime, []);
}

export function NumberDraw({ soundOn, t }: Props) {
    const audio = useStableAudio();
    const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const resultCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        numberHistory: history, setNumberHistory: setHistory,
        startStr, setStartStr,
        endStr, setEndStr,
        noRepeat, setNoRepeat,
        display, setDisplay,
    } = useHistory();
    const [isRolling, setIsRolling] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [resultCopied, setResultCopied] = useState(false);

    const bounds = useMemo(() => parseBounds(startStr, endStr), [startStr, endStr]);
    const range = useMemo(() => boundsToRange(bounds), [bounds]);
    const rangeCount = range.length;
    const lo = range[0] ?? 0;
    const hi = range[rangeCount - 1] ?? 0;

    const historySet = useMemo(() => new Set(history), [history]);
    const pool = useMemo(
        () => (noRepeat ? range.filter((n) => !historySet.has(n)) : null),
        [noRepeat, range, historySet],
    );

    const stopTickTimers = useCallback((): void => {
        if (tickTimerRef.current !== null) {
            clearInterval(tickTimerRef.current);
            tickTimerRef.current = null;
        }
    }, []);

    useEffect(
        () => () => {
            stopTickTimers();
            if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
            if (resultCopiedTimerRef.current !== null) clearTimeout(resultCopiedTimerRef.current);
        },
        [stopTickTimers],
    );

    const finishRoll = useCallback(
        (target: number): void => {
            setDisplay(target);
            audio.playRevealSound(soundOn);
            setHistory((h) => prependCapped(h, target, HISTORY_CAP));
            setIsRolling(false);
        },
        [audio, soundOn],
    );

    const runNumberReveal = useCallback(
        (target: number): void => {
            const tickId = window.setInterval(() => audio.playRollTick(soundOn), 95);
            tickTimerRef.current = tickId;

            const shuffleId = window.setInterval(() => {
                setDisplay(() => randomIntInclusive(lo, hi));
            }, 48);

            window.setTimeout(() => {
                stopTickTimers();
                window.clearInterval(shuffleId);
                finishRoll(target);
            }, ANIM_NUMBER_MS);
        },
        [audio, finishRoll, hi, lo, soundOn, stopTickTimers],
    );

    const performRoll = useCallback(() => {
        const prepared = prepareRoll({ boundsOk: bounds.ok, rangeCount, isRolling, noRepeat, pool, range, lo, hi });
        if (prepared.tag !== "ready") return;

        setIsRolling(true);
        runNumberReveal(prepared.target);
    }, [bounds.ok, hi, isRolling, lo, noRepeat, pool, range, rangeCount, runNumberReveal]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            e.preventDefault();
            performRoll();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [performRoll]);

    const copyResult = useCallback(async (): Promise<void> => {
        if (display === null) return;
        try {
            await navigator.clipboard.writeText(String(display));
            if (resultCopiedTimerRef.current !== null) clearTimeout(resultCopiedTimerRef.current);
            setResultCopied(true);
            resultCopiedTimerRef.current = window.setTimeout(() => {
                setResultCopied(false);
                resultCopiedTimerRef.current = null;
            }, 1500);
        } catch {
            /* ignore */
        }
    }, [display]);

    const handleCopyHistoryItem = useCallback(async (n: number, idx: number): Promise<void> => {
        try {
            await navigator.clipboard.writeText(String(n));
            if (copiedTimerRef.current !== null) clearTimeout(copiedTimerRef.current);
            setCopiedIdx(idx);
            copiedTimerRef.current = window.setTimeout(() => {
                setCopiedIdx(null);
                copiedTimerRef.current = null;
            }, 1500);
        } catch {
            /* ignore */
        }
    }, []);

    const clearHistory = useCallback((): void => setHistory([]), []);

    const applyPreset = useCallback((start: number, end: number): void => {
        setStartStr(String(start));
        setEndStr(String(end));
    }, []);

    const canRoll = canRollAttempt({ boundsOk: bounds.ok, rangeCount, isRolling, noRepeat, pool });
    const poolEmpty = poolBlocksRoll(noRepeat, pool);

    return (
        <>
            <div className="nd-layout">
                <div className="nd-col-left">
                    <div className="range-grid">
                        <div className="field">
                            <label htmlFor="start">{t.start}</label>
                            <input
                                id="start"
                                type="number"
                                inputMode="numeric"
                                value={startStr}
                                onChange={(e) => setStartStr(e.target.value)}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="end">{t.end}</label>
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

                    {!bounds.ok && <p className="err">{t.invalidRange}</p>}

                    <div className="options">
                        <label className="checkbox-row">
                            <input type="checkbox" checked={noRepeat} onChange={(e) => setNoRepeat(e.target.checked)} />
                            {t.noRepeat}
                        </label>
                    </div>
                </div>

                <div className="nd-col-right">
                    <section className="result-shell" aria-live="polite">
                        <div className="result-shell-top">
                            <span className="result-label">{t.resultLabel}</span>
                            <button
                                type="button"
                                className={`btn-mini${resultCopied ? " copied" : ""}`}
                                onClick={copyResult}
                                disabled={display === null}
                            >
                                {resultCopied && display !== null ? t.copiedResult(display) : t.copyResult}
                            </button>
                        </div>
                        <div className="result-main">
                            <div className={`result-number${isRolling ? " rolling-anim" : ""}`}>
                                {display === null ? "?" : display}
                            </div>
                        </div>
                        <p className="result-sub">{poolEmpty ? t.poolEmpty : isRolling ? t.rolling : t.pressRoll}</p>
                    </section>

                    <div className="actions">
                        <button type="button" className="btn-roll" onClick={performRoll} disabled={!canRoll}>
                            {t.rollBtn}
                        </button>
                    </div>

                    <div className="history-head">
                        <span className="history-title">{t.historyTitle}</span>
                        <button type="button" className="btn-mini" onClick={clearHistory}>
                            {t.clearHistory}
                        </button>
                    </div>
                    <div className="history-list history-list--grid">
                        {history.length === 0 ? (
                            <div className="history-empty">{t.noRecords}</div>
                        ) : (
                            history.map((n, i) => (
                                <div
                                    key={`${n}-${i}`}
                                    className={`history-item history-item--grid${copiedIdx === i ? " copied" : ""}`}
                                    onClick={() => handleCopyHistoryItem(n, i)}
                                >
                                    <span className="history-seq">#{history.length - i}</span>
                                    <span className="history-val">{n}</span>
                                    <div className="history-item-overlay">
                                        {copiedIdx === i ? t.copiedNumber(n) : t.copyNumber}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <footer className="footer">
                <span>Enter / Space</span>
                <span>Designed by Gomez</span>
            </footer>
        </>
    );
}
