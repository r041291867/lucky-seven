# Lucky Seven

一個以 React + Vite 製作的抽號網頁，支援數字快速抽取與可視化轉盤抽取。

## 特色

- 支援自訂起始值與結束值的數字範圍
- 內建常用範圍快速套用
- 提供 `數字模式` 與 `轉盤模式`
- 可開啟 `不重複抽取`，並可重置抽籤池
- 保留抽取歷史，支援一鍵複製結果
- 支援鍵盤快捷鍵（`Enter` / `Space`）觸發抽取

## 技術棧

- React
- TypeScript
- Vite

## 本機啟動

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview
```

## 操作說明

1. 輸入起始值與結束值，或使用預設範圍。
2. 選擇 `數字模式` 或 `轉盤模式`（轉盤模式有最大數量限制）。
3. 需要避免重複時，勾選 `不重複抽取`。
4. 按下 `ROLL` 開始抽取，結果會顯示在中間區域並加入歷史紀錄。

## GitHub Description（可直接使用）

可視化隨機抽號網頁（React + Vite），支援自訂範圍、數字/轉盤模式、不重複抽取與歷史紀錄。
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
