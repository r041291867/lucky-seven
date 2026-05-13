import type { JiaobeiOutcome } from "./domain/jiaobei";

export type Lang = "zh" | "en";
export type Theme = "dark" | "light";

interface I18nDict {
    subtitleNumber: string;
    subtitleJiaobei: string;
    pageNumber: string;
    pageJiaobei: string;
    start: string;
    end: string;
    noRepeat: string;
    rollBtn: string;
    copyResult: string;
    copiedResult: (n: number | string) => string;
    poolEmpty: string;
    rolling: string;
    pressRoll: string;
    historyTitle: string;
    jiaobeiHistoryTitle: string;
    clearHistory: string;
    noRecords: string;
    copyNumber: string;
    copiedNumber: (n: number | string) => string;
    tossing: string;
    toss: string;
    outcomes: Record<JiaobeiOutcome, string>;
    legendSheng: string;
    legendXiao: string;
    legendYin: string;
    invalidRange: string;
    mute: string;
    unmute: string;
    /** Label shown on the language button — text of the language to switch TO */
    langLabel: string;
    resultLabel: string;
    jiaobeiResultLabel: string;
}

export const i18n: Record<Lang, I18nDict> = {
    zh: {
        subtitleNumber: "提供快速抽選幸運頻道/數字",
        subtitleJiaobei: "請虔誠地在心中默念您的求問事項",
        pageNumber: "抽選數字",
        pageJiaobei: "線上擲茭",
        start: "起始值",
        end: "結束值",
        noRepeat: "不重複抽取",
        rollBtn: "抽選",
        copyResult: "複製結果",
        copiedResult: (n) => `已複製: ${n}`,
        poolEmpty: "抽選池已空，請清空紀錄或關閉不重複",
        rolling: "挑選幸運數字…",
        pressRoll: "按下抽選鈕開始",
        historyTitle: "歷史紀錄",
        jiaobeiHistoryTitle: "擲筊紀錄",
        clearHistory: "清空紀錄",
        noRecords: "尚無紀錄",
        copyNumber: "複製數字",
        copiedNumber: (n) => `已複製: ${n}`,
        tossing: "擲筊中…",
        toss: "擲筊",
        outcomes: { sheng: "聖筊", xiao: "笑筊", yin: "陰筊" },
        legendSheng: "表示神明允許、同意，或行事會順利。又稱允筊。",
        legendXiao: "表示神明一笑、不解，或者考慮中，行事狀況不明，可以重新再擲筊請示神明，或再次說清楚自己的祈求。",
        legendYin: "表示神明否定、憤怒，或者不宜行事，可以重新再擲筊請示。",
        invalidRange: "請輸入有效的數字範圍。",
        mute: "靜音",
        unmute: "開啟聲音",
        langLabel: "EN",
        resultLabel: "抽選結果",
        jiaobeiResultLabel: "擲筊",
    },
    en: {
        subtitleNumber: "Quick random number picker",
        subtitleJiaobei: "Focus quietly on your question before tossing",
        pageNumber: "Draw Number",
        pageJiaobei: "Jiaobei",
        start: "Start",
        end: "End",
        noRepeat: "No repeat",
        rollBtn: "ROLL",
        copyResult: "Copy",
        copiedResult: (n) => `Copied: ${n}`,
        poolEmpty: "Pool empty — clear history or disable no-repeat",
        rolling: "Rolling…",
        pressRoll: "Press Roll",
        historyTitle: "HISTORY",
        jiaobeiHistoryTitle: "JIAOBEI HISTORY",
        clearHistory: "Clear",
        noRecords: "No records",
        copyNumber: "Copy",
        copiedNumber: (n) => `Copied: ${n}`,
        tossing: "Tossing…",
        toss: "Toss",
        outcomes: { sheng: "Assent", xiao: "Amused", yin: "Denial" },
        legendSheng: "The deity agrees — your request is granted or things will go smoothly.",
        legendXiao: "The deity smiles or is puzzled — the outcome is uncertain. Toss again or clarify your question.",
        legendYin: "The deity disagrees or is displeased — the endeavour is inadvisable. You may toss again.",
        invalidRange: "Please enter a valid number range.",
        mute: "Mute",
        unmute: "Unmute",
        langLabel: "中",
        resultLabel: "RESULT",
        jiaobeiResultLabel: "JIAOBEI",
    },
};
