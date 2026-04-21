# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A collection of standalone HTML-based LEGO parts checklists. Users can mark off parts as they collect them, track progress by piece count, filter by color or sub-model, and save progress via browser LocalStorage. The repository currently covers ~10 LEGO sets, mostly Star Wars themed.

## No Build Step

These are static HTML files with no dependencies, no package manager, and no build process. Open any `.html` file directly in a browser to use it.

## Architecture

Each file is completely self-contained — all CSS, JavaScript, and part data live inline in a single `.html` file. There are no shared templates, imports, or external libraries (only Google Fonts CDN).

### Standard file structure

```
<head>
  Google Fonts (Orbitron, IBM Plex Mono)
  <style> — full page CSS, dark theme via CSS custom properties
<body>
  <header> — sticky, shows live progress stats
  <div class="controls"> — status filter buttons (All / Remaining / Found)
  <div class="color-filters"> — dynamically generated color pill buttons
  <div class="grid" id="grid"> — dynamically generated part cards
  <script> — all app logic
```

### Part data format

```js
const parts = [
  { qty: 2, part: "3001", name: "Brick 2x4", color: "Dark Bluish Gray", colorId: 85, sub: "Hull" },
  // ...
];
```

`colorId` is the LEGO/BrickLink color ID used to construct image URLs via `imgUrl()`.

### Key JavaScript functions (present in every file)

| Function | Purpose |
|---|---|
| `imgUrl(part, colorId)` | Builds BrickLink image URL |
| `loadProgress()` / `saveProgress()` | LocalStorage persistence (key: `lego[SetNumber]_counts`) |
| `buildGrid()` | Renders all part cards from the `parts` array |
| `applyFilters()` | Hides/shows cards by status, color, and sub-model |
| `updateProgress()` | Refreshes header stats |
| `exportProgress()` / `importProgress()` | JSON serialization of `foundCounts` |
| `resetAll()` | Clears progress after confirmation |

### State

```js
let foundCounts = {};    // { partIndex: quantityFound }
let activeFilter = "all"; // "all" | "remaining" | "found"
let activeColor = "All";
let activeSub = "All";
```

### CSS design system

Each file uses CSS custom properties on `:root` with a consistent dark theme. Accent color varies per set. Key variables: `--bg`, `--surface`, `--border`, `--accent`, `--text`, `--text-dim`, `--done`, `--done-border`.

Card states use class toggles: `.found` (fully collected), `.partial` (partially collected), `.hidden` (filtered out).

## Documentation

```
__docs__/
├── analysis/          ← git-ignored; ephemeral analysis and planning docs
│   ├── current-state.md     — per-file breakdown of all 10 sets (schema, storage keys, features)
│   └── refactoring-plan.md  — plan for data/template/build split and GH Pages CI/CD
```

`__docs__/analysis/` is listed in `.gitignore` and is not committed. Documents there capture research and decisions at a point in time; they may become stale.

## Adding a New Set

When creating a new checklist HTML file:

1. Copy the most recent file (currently `75074-snowspeeder-microfighter.html`) as the starting template — it has the most evolved UI patterns including multiplier support and gradient header styling.
2. Replace the `parts` array with the new set's data.
3. Update the LocalStorage key in `saveProgress()` / `loadProgress()` to be unique for the new set (e.g., `lego75095_counts`).
4. Update the page title, header text, and `--accent` color to match the set's theme.
5. If the set has sub-models, populate the `sub` field on each part; otherwise omit sub-model filter UI.
