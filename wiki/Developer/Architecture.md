# Architecture

The whole app is a single ES module (`main.js`) plus one stylesheet
(`style.css`), bundled by [Vite](https://vitejs.dev/). There is **no framework**
and no runtime dependency.

## Big picture

```
index.html ──imports──▶ main.js ──imports──▶ style.css
   │                        │
   │                        ├── fetches ./data.json   (country pool)
   │                        ├── fetches ./world.svg   (Map mode)
   │                        ├── fetches ./focus.json  (Map mode zoom boxes)
   │                        └── globs ./locales/*.json (translations)
   └── #app  ◀── everything is rendered here via innerHTML
```

## Rendering model

There is no virtual DOM and no reactivity. The app works by **string templates +
full replacement**:

1. A `render*()` function returns an HTML string.
2. That string is assigned to `app.innerHTML` (where `app` is `#app`).
3. Event listeners are re-bound by functions like `bindHeaderControls()`.
4. State lives in module-level `let` variables; mutating them has no effect until
   the next render happens.

This keeps the code small and predictable. The trade-off is that anything holding
DOM references must be queried again after every render, and focus is managed by
hand (e.g. `nextBtn.focus()`).

### The view functions

- `showWelcome()` → `renderWelcome()`
- `renderQuestion()` — one quiz question (replaces the whole app each time)
- `renderResult()` — the end-of-quiz summary
- `rerender()` — re-renders whatever is currently on screen (used after a
  language change)

`renderHeader()` is included at the top of every screen and produces the logo,
mode switch, timer control, variant toggle, and settings button — plus the
settings modal.

## State

All mutable state is declared in one block near the top of `main.js`:

```js
let countries = []        // all entries from data.json
let quizQuestions = []    // the questions for the current quiz
let missedQuestions = []  // questions answered wrong (for Retry Missed)
let currentIndex = 0
let score = 0
let points = 0
let currentStreak = 0
let bestStreak = 0
let bestStreakAtStart = 0
let streakRecordCelebrated = false
let answered = false
let lastSelected = null
let timerId, timeLeft, timerPaused
```

Settings values (`quizMode`, `questionsPerQuiz`, `optionsCount`, `timerEnabled`,
`timerSeconds`, `themeVariant`, `language`, `locale`) are tracked in their own
nearby variables and always mirrored to `localStorage` by their `apply*`
functions.

## The `apply` / `load` convention

Every persisted setting follows the same pair of helpers:

- `loadX()` — read from `localStorage`, validate/clamp, fall back to a default.
- `applyX(value)` — clamp, set the module variable, write to `localStorage`, and
  update the DOM.

`init()` calls `apply(load())` for every setting at startup so the stored state
becomes live state. The same pattern is reused by `resetApp()`.

## Localization

Locale files are discovered at **build time** with
`import.meta.glob('./locales/*.json', { eager: true, import: 'default' })`. The
`t(key, vars)` function looks up the current locale's `ui` strings, falls back to
English, and finally to the key itself, interpolating `{placeholder}` values.
`countryName()` / `capitalName()` do the same for the `countries` / `capitals`
maps. See [Localization](Localization.md).

## Command line

The command line is a single `<div id="cmdline">` appended to `<body>` once at
module load, plus a parser (`runCommand`) and a tab-completion engine. See
[Command Line Internals](Command-Line-Internals.md).

## Data loading and failure

`init()` fetches `./data.json`. On failure it renders a single error card using
the `error.loadFailed` string. Map assets (`world.svg`, `focus.json`) are lazily
fetched, cached in promises, and degrade gracefully — a missing map just shows an
empty prompt rather than breaking the quiz.

Related: [Project Structure](Project-Structure.md) · [Quiz Flow](Quiz-Flow.md)
