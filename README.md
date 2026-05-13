# Lucky Channel

幸運頻道 — 抽籤與擲筊工具。

A lucky number picker and jiaobei (divination) tool built with React + TypeScript + Vite.

## Features

- **抽選數字 / Draw Number** — Pick a random number from a custom range, with optional no-repeat mode and preset ranges.
- **線上擲筊 / Jiaobei** — Simulate the traditional Taiwanese jiaobei divination ritual.
- Chinese / English language toggle
- Dark / light theme toggle
- Keyboard shortcut: `Enter` or `Space` to roll / toss
- Responsive layout (mobile ≤ 767 px, desktop ≥ 768 px)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- CSS custom properties for theming (no CSS-in-JS)
- Functional-programming domain layer (`src/domain/`)

## Getting Started

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Project Structure

```
src/
  App.tsx          # Root component — routing, theme, i18n
  NumberDraw.tsx   # Number picker feature
  Jiaobei.tsx      # Jiaobei feature
  i18n.ts          # zh / en translation strings
  sound.ts         # Web Audio runtime
  constants.ts     # Shared constants
  domain/
    draw.ts        # Pure draw / pool logic
    jiaobei.ts     # Pure jiaobei logic
    range.ts       # Range parsing and generation
```

## Credits

Designed by Gomez
