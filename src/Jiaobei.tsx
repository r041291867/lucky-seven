import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ANIM_JIAOBEI_MS, HISTORY_CAP } from "./constants";
import { prependCapped } from "./domain/draw";
import { throwJiaobei, type JiaobeiFace, type JiaobeiOutcome } from "./domain/jiaobei";
import type { i18n } from "./i18n";
import { createAudioRuntime, type AudioRuntime } from "./sound";

type I18nDict = (typeof i18n)[keyof typeof i18n];

type JiaobeiHistoryEntry = Readonly<{
    left: JiaobeiFace;
    right: JiaobeiFace;
    outcome: JiaobeiOutcome;
}>;

interface Props {
    soundOn: boolean;
    t: I18nDict;
}

function useStableAudio(): AudioRuntime {
    return useMemo(createAudioRuntime, []);
}

export function Jiaobei({ soundOn, t }: Props) {
    const audio = useStableAudio();
    const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [jiaobeiLeft, setJiaobeiLeft] = useState<JiaobeiFace>("yin");
    const [jiaobeiRight, setJiaobeiRight] = useState<JiaobeiFace>("yang");
    const [jiaobeiResult, setJiaobeiResult] = useState<JiaobeiOutcome | null>(null);
    const [jiaobeiHistory, setJiaobeiHistory] = useState<readonly JiaobeiHistoryEntry[]>([]);
    const [isTossing, setIsTossing] = useState(false);

    const stopTickTimers = useCallback((): void => {
        if (tickTimerRef.current !== null) {
            clearInterval(tickTimerRef.current);
            tickTimerRef.current = null;
        }
    }, []);

    useEffect(() => () => stopTickTimers(), [stopTickTimers]);

    const performThrow = useCallback(() => {
        if (isTossing) return;
        setIsTossing(true);

        const tickId = window.setInterval(() => audio.playJiaobeiTick(soundOn), 105);
        tickTimerRef.current = tickId;

        const shuffleId = window.setInterval(() => {
            const shuffled = throwJiaobei();
            setJiaobeiLeft(shuffled.left);
            setJiaobeiRight(shuffled.right);
        }, 90);

        window.setTimeout(() => {
            stopTickTimers();
            window.clearInterval(shuffleId);
            const final = throwJiaobei();
            setJiaobeiLeft(final.left);
            setJiaobeiRight(final.right);
            setJiaobeiResult(final.outcome);
            setJiaobeiHistory((h) => prependCapped(h, final, HISTORY_CAP));
            audio.playJiaobeiDrop(soundOn);
            setIsTossing(false);
        }, ANIM_JIAOBEI_MS);
    }, [audio, isTossing, soundOn, stopTickTimers]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            e.preventDefault();
            performThrow();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [performThrow]);

    const clearJiaobeiHistory = useCallback((): void => setJiaobeiHistory([]), []);

    const tossResultText = jiaobeiResult === null ? "?" : t.outcomes[jiaobeiResult];

    return (
        <>
            <div className="jb-layout">
                <div className="jb-col-left">
                    <section className="result-shell" aria-live="polite">
                        <div className="result-shell-top">
                            <span className="result-label">{t.jiaobeiResultLabel}</span>
                        </div>
                        <div className="result-main">
                            <div className="jiaobei-stage">
                                <div
                                    className={`jiaobei-block jiaobei-left jiaobei-${jiaobeiLeft}${isTossing ? " tossing" : ""}`}
                                />
                                <div
                                    className={`jiaobei-block jiaobei-right jiaobei-top jiaobei-${jiaobeiRight}${isTossing ? " tossing" : ""}`}
                                />
                            </div>
                        </div>
                        <p className="result-sub">{isTossing ? t.tossing : tossResultText}</p>
                    </section>

                    <div className="actions">
                        <button type="button" className="btn-roll" onClick={performThrow} disabled={isTossing}>
                            {t.toss}
                        </button>
                    </div>
                </div>

                <div className="jb-col-right">
                    <div className="history-head">
                        <span className="history-title">{t.jiaobeiHistoryTitle}</span>
                        <button type="button" className="btn-mini" onClick={clearJiaobeiHistory}>
                            {t.clearHistory}
                        </button>
                    </div>
                    <div className="history-list">
                        {jiaobeiHistory.length === 0 ? (
                            <div className="history-empty">{t.noRecords}</div>
                        ) : (
                            jiaobeiHistory.map((item, i) => (
                                <div key={`${item.outcome}-${i}`} className="history-item history-item--list">
                                    <span>#{jiaobeiHistory.length - i}</span>
                                    <span className="history-val">{t.outcomes[item.outcome]}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="jiaobei-legend">
                        <div className="jiaobei-legend-item">
                            <span className="jiaobei-legend-name">{t.outcomes.sheng}</span>
                            <span className="jiaobei-legend-desc">{t.legendSheng}</span>
                        </div>
                        <div className="jiaobei-legend-item">
                            <span className="jiaobei-legend-name">{t.outcomes.xiao}</span>
                            <span className="jiaobei-legend-desc">{t.legendXiao}</span>
                        </div>
                        <div className="jiaobei-legend-item">
                            <span className="jiaobei-legend-name">{t.outcomes.yin}</span>
                            <span className="jiaobei-legend-desc">{t.legendYin}</span>
                        </div>
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
