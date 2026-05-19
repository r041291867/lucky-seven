import { useEffect, useState } from "react";
import "./App.css";
import { HistoryProvider } from "./HistoryContext";
import { i18n, type Lang, type Theme } from "./i18n";
import { Jiaobei } from "./Jiaobei";
import { NumberDraw } from "./NumberDraw";

type Page = "number" | "jiaobei";

function SpeakerOnIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    );
}

function SpeakerOffIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

export default function App() {
    const [page, setPage] = useState<Page>("number");
    const [soundOn, setSoundOn] = useState(true);
    const [lang, setLang] = useState<Lang>("zh");
    const [theme, setTheme] = useState<Theme>("dark");

    const t = i18n[lang];

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const handleSetPage = (p: Page): void => setPage(p);

    const toggleLang = (): void => setLang((l) => (l === "zh" ? "en" : "zh"));
    const toggleTheme = (): void => setTheme((th) => (th === "dark" ? "light" : "dark"));

    return (
        <HistoryProvider>
        <div className="app">
            <div className="card">
                <header className="header">
                    <span className="brand">LUCKY CHANNEL</span>
                    <div className="header-right">
                        <button type="button" className="btn-lang" onClick={toggleLang}>
                            {t.langLabel}
                        </button>
                        <button
                            type="button"
                            className="btn-sound"
                            onClick={toggleTheme}
                            title={theme === "dark" ? "切換淺色" : "切換深色"}
                        >
                            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button
                            type="button"
                            className="btn-sound"
                            onClick={() => setSoundOn((s) => !s)}
                            title={soundOn ? t.mute : t.unmute}
                        >
                            {soundOn ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                        </button>
                    </div>
                </header>
                <p className="header-subtitle">
                    {page === "jiaobei" ? t.subtitleJiaobei : t.subtitleNumber}
                </p>

                <div className="feature-row">
                    <button
                        type="button"
                        className={`mode-btn${page === "number" ? " active" : ""}`}
                        onClick={() => handleSetPage("number")}
                    >
                        {t.pageNumber}
                    </button>
                    <button
                        type="button"
                        className={`mode-btn${page === "jiaobei" ? " active" : ""}`}
                        onClick={() => handleSetPage("jiaobei")}
                    >
                        {t.pageJiaobei}
                    </button>
                </div>

                {page === "number" ? (
                    <NumberDraw soundOn={soundOn} t={t} />
                ) : (
                    <Jiaobei soundOn={soundOn} t={t} />
                )}
            </div>
        </div>
        </HistoryProvider>
    );
}
