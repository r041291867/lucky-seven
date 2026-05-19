import { createContext, useContext, useState, type ReactNode } from "react";
import type { JiaobeiFace, JiaobeiOutcome } from "./domain/jiaobei";

export type JiaobeiHistoryEntry = Readonly<{
    left: JiaobeiFace;
    right: JiaobeiFace;
    outcome: JiaobeiOutcome;
}>;

interface HistoryContextValue {
    numberHistory: readonly number[];
    setNumberHistory: React.Dispatch<React.SetStateAction<readonly number[]>>;
    startStr: string;
    setStartStr: React.Dispatch<React.SetStateAction<string>>;
    endStr: string;
    setEndStr: React.Dispatch<React.SetStateAction<string>>;
    noRepeat: boolean;
    setNoRepeat: React.Dispatch<React.SetStateAction<boolean>>;
    display: number | null;
    setDisplay: React.Dispatch<React.SetStateAction<number | null>>;
    jiaobeiHistory: readonly JiaobeiHistoryEntry[];
    setJiaobeiHistory: React.Dispatch<React.SetStateAction<readonly JiaobeiHistoryEntry[]>>;
    jiaobeiLeft: JiaobeiFace;
    setJiaobeiLeft: React.Dispatch<React.SetStateAction<JiaobeiFace>>;
    jiaobeiRight: JiaobeiFace;
    setJiaobeiRight: React.Dispatch<React.SetStateAction<JiaobeiFace>>;
    jiaobeiResult: JiaobeiOutcome | null;
    setJiaobeiResult: React.Dispatch<React.SetStateAction<JiaobeiOutcome | null>>;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
    const [numberHistory, setNumberHistory] = useState<readonly number[]>([]);
    const [startStr, setStartStr] = useState("1");
    const [endStr, setEndStr] = useState("2000");
    const [noRepeat, setNoRepeat] = useState(false);
    const [display, setDisplay] = useState<number | null>(null);
    const [jiaobeiHistory, setJiaobeiHistory] = useState<readonly JiaobeiHistoryEntry[]>([]);
    const [jiaobeiLeft, setJiaobeiLeft] = useState<JiaobeiFace>("yin");
    const [jiaobeiRight, setJiaobeiRight] = useState<JiaobeiFace>("yang");
    const [jiaobeiResult, setJiaobeiResult] = useState<JiaobeiOutcome | null>(null);

    return (
        <HistoryContext.Provider value={{
            numberHistory, setNumberHistory,
            startStr, setStartStr,
            endStr, setEndStr,
            noRepeat, setNoRepeat,
            display, setDisplay,
            jiaobeiHistory, setJiaobeiHistory,
            jiaobeiLeft, setJiaobeiLeft,
            jiaobeiRight, setJiaobeiRight,
            jiaobeiResult, setJiaobeiResult,
        }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory(): HistoryContextValue {
    const ctx = useContext(HistoryContext);
    if (ctx === null) throw new Error("useHistory must be used within HistoryProvider");
    return ctx;
}
