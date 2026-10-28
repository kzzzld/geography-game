# Quiz Flow

How a quiz moves from the **Play** button to the results screen. For the
player-facing version, see [Playing a Quiz](../User/Playing-a-Quiz.md).

## Overview

```
init() ─▶ showWelcome() ─[Play]─▶ startQuiz()
                                   │
                                   ▼
                            beginQuiz(buildQuiz())
                                   │
                                   ▼
                    ┌────▶ renderQuestion()
                    │            │
                    │            ▼
                    │      handleAnswer(btn)   (or handleTimeout)
                    │            │
                    │            ▼
                    │       revealNext()  → shows #nextBtn
                    │            │
                    └── handleNext() ──▶ renderQuestion()
                                   │
                    (last question)│
                                   ▼
                            renderResult()
                              ├─ Play Again ─▶ startQuiz()
                              └─ Retry Missed ─▶ retryMissed()
```

The welcome card's daily button and `:daily` take a different entry point,
`openDaily()`; see [Daily challenge](#daily-challenge).

## 1. Boot

`init()` (last line of `main.js`):

1. Applies every stored setting via `apply(load())`.
2. Shows the loading screen and starts preloading fonts and map assets in
   parallel — see [Architecture](Architecture.md).
3. `await fetch('./data.json')` into `countries`.
4. Waits for the preloads (unless the user pressed **Skip**), then calls
   `showWelcome()`.
5. On fetch failure, renders the `error.loadFailed` message.

## 2. Starting

`startQuiz()` calls `beginQuiz(buildQuiz())`. `buildQuiz()` builds a pool (in
**Map → Country**, countries without a two-letter map code are dropped), shuffles
it, takes `questionsPerQuiz`, and builds each question.

In **Infinite** mode `buildQuiz()` instead returns a single `randomQuestion()`
(a flag prompt for a random country, so repeats are possible). `handleNext()`
appends another one after every answer while lives remain, so the list never
runs out — see [Infinite](#infinite-mode).

`beginQuiz(questions)` resets all per-quiz state:

```js
quizQuestions = questions
missedQuestions = []
currentIndex = 0
score = 0
points = 0
livesLeft = quizMode === 'infinite' ? lives : 0
resetStreak()
bestStreakAtStart = bestStreak   // snapshot for record detection
streakRecordCelebrated = false
lastSelected = null
quizStartTime = Date.now()
preloadQuestionImages(quizQuestions)
renderQuestion()
```

Note that `bestStreakAtStart` snapshots the all-time best so the app can tell
when you beat it *during this quiz* and celebrate once.

## 3. Rendering a question

`renderQuestion()` resets `answered = false`, then builds a prompt depending on
`q.mode`:

| Mode | Prompt |
| --- | --- |
| `flag` | `<img>` of the flag |
| `capital` | "Capital of" + translated capital name |
| `law` | "Name in law" + the entry's `native` name, with `dir="auto"` so RTL scripts render right-to-left |
| `map` | An empty `.world-map` div, hydrated asynchronously |
| anything else (`country`) | The country name |

Options are rendered as buttons, each with a letter label. In **Country → Flag**
mode the options are flag images instead of text.

After setting `innerHTML`, it re-binds click handlers, calls
`bindHeaderControls()`, kicks off `hydrateWorldMap()` (no-op except in map mode),
focuses the first answer, and starts the timer if enabled.

## 4. Answering

`handleAnswer(btn)`:

- Guards against double answers, stops the timer.
- Computes `isCorrect` by comparing `btn.dataset.country` with
  `q.country.country`.
- On correct: `score++`, updates the streak (and best streak), and if timed,
  adds `SCORE_BASE + timeLeft * SCORE_TIME_BONUS` to `points`.
- On wrong: pushes the question to `missedQuestions`, resets the streak, and — in
  **Infinite** mode — decrements `livesLeft`.
- Marks all buttons disabled, adds `.correct` / `.wrong` classes.
- Calls `updateScoreBar()`, `animateStreak()` on a correct answer, and
  `revealNext()`.

`animateStreak(isRecord)` bumps the score-bar flame, fires `flashStreakBurst()`
on a new all-time best, and — when the streak is a non-zero multiple of 5 —
calls `celebrateStreak(count)`, which appends a full-screen `.streak-celebration`
node to `<body>` (count, flame, ring, confetti) and removes it after 1.6s. Both
effects no-op when `prefersReducedMotion()` is true, which includes
[lite mode](../User/Lite-Mode.md).

`handleTimeout()` is the same ending when the timer hits zero, except there is no
selected answer and the question is always counted as missed (and costs a life in
Infinite mode).

## 5. Advancing

`revealNext()` shows `#nextBtn` and labels it **Next** or **See Results**
depending on position. `handleNext()` increments `currentIndex`, appends a new
`randomQuestion()` when in Infinite mode with lives left, then either renders the
next question or `renderResult()`.

## 6. Results

`renderResult()` computes accuracy and elapsed time:

- Accuracy = `round(score / total * 100)`.
- Time = `(Date.now() - quizStartTime)` formatted `m:ss`.
- Shows best streak and (timed only) points + time, and the missed count.
- Buttons: **Retry Missed** (only if anything was missed) and **Play Again**.
- In Infinite mode the heading reads **Run Over!** and `total` is however many
  questions the run lasted.

## 7. Retry

`retryMissed()` maps `missedQuestions` through `buildQuestion(q.country, q.mode)`
— same prompt modes, new wrong options — and calls `beginQuiz()` again.

## Daily challenge

The daily is a fixed variant of the same flow: 20 **Flag → Country** questions,
5 options, never timed. It is not a `QUIZ_MODES` entry; `openDaily()` decides
between starting a run and showing today's stored result. The welcome card's
`#dailyBtn` and the `:daily` command both call it.

### Seeded puzzle

The puzzle comes from the UTC date rather than `Math.random()`:

```
dailyDateKey()  →  "YYYY-MM-DD" (UTC)
      │
      ▼
hashSeed(dateKey)  →  32-bit FNV-1a
      │
      ▼
seededRandom(seed)  →  mulberry32
      │
      ▼
buildDailyQuiz(dateKey)
      ├─ shuffleWith(countries, rng)
      ├─ slice the first DAILY_QUESTIONS (20)
      └─ buildQuestion(country, 'flag', rng, DAILY_OPTIONS) (5 options)
```

`dailyDateKey()` is `new Date().toISOString().slice(0, 10)`, so the day rolls
over at UTC midnight. `buildDailyQuiz()` passes the same `rng` through the
country shuffle, the wrong-option shuffle, and the option shuffle, so both the
question order and every option order are deterministic. The fixed
`DAILY_QUESTIONS` / `DAILY_OPTIONS` constants make the run ignore the
`questionsPerQuiz` and `optionsCount` settings.

### Deviations from the normal flow

- `openDaily()` calls `startDaily()` only when `dailyResultToday()` has no run
  for today. Otherwise it clears `dailyDate` and calls `renderDailyResult()`
  directly on the stored run.
- `startDaily()` sets `dailyDate = dailyDateKey()`, clears `dailyNewBest`, and
  calls `beginQuiz(buildDailyQuiz(dailyDate))`.
- `renderQuestion()` starts the timer only when `timerEnabled && !dailyDate`, so
  the daily is untimed even with the timer setting on.
- `handleAnswer()` and `handleTimeout()` push a boolean into `answerLog`. The
  untimed daily builds its log from `handleAnswer()` alone.
- `handleNext()` calls `renderDailyResult()` instead of `renderResult()` when
  `dailyDate` is set and the last question has been answered.
- `startQuiz()` clears `dailyDate`, so **Play Again** on the daily result starts
  an ordinary quiz.

`renderDailyResult()` records the run through `recordDailyRun()` when
`dailyDate` is set. `recordDailyRun()` returns the stored run if one already
exists for that date; otherwise it builds `{ date, score, total, time, log }`,
compares it with `flag-quiz-daily-best` using `isBetterDailyRun()` (higher
score, then faster time), writes the result, and writes the best too when the
run set a record. That comparison also sets `dailyNewBest`, which selects the
**New personal best!** line.

### Re-rendering

`rerender()` checks for `#dailyShareBtn` before the normal result and question
checks, so a language change re-renders the daily result screen in place.

### Share image

`exportDailyImage(run)` builds a 1080×1080 canvas with
`buildDailyShareCanvas(run)` and downloads it as
`geography-daily-<date>.png`. The canvas reads the active theme's CSS variables
(`--bg`, `--bg-card`, `--border`, `--accent`, `--primary`, `--text`,
`--text-muted`, `--success`, `--error`, and `--font-family`) through
`getComputedStyle()`, so the card follows the current theme and font. It draws
the app name, date, score, accuracy, a 10-column grid from `run.log`, the
personal best, and `location.host`. The status line under the result buttons
reports the saved or failed state.

## Infinite mode

`infinite` is a `QUIZ_MODES` entry whose prompt always resolves to `flag`
(`buildQuestion` maps `infinite → flag`). The run is lives-based:

- `beginQuiz()` sets `livesLeft = lives` (the `flag-quiz-lives` setting, 1–10).
- `buildQuiz()` seeds the list with one `randomQuestion()`; `handleNext()` pushes
  another after each answer while `livesLeft > 0`, drawing a country at random
  each time (repeats allowed).
- A wrong answer or `handleTimeout()` decrements `livesLeft`.
- When `livesLeft` reaches `0`, `handleNext()` stops appending, `currentIndex`
  reaches `quizQuestions.length`, and `renderResult()` runs.
- `scoreBarContent()` swaps the `Question N / total` label for `Question N` and
  inserts `livesBadge()`, a heart counter (pulsing when only one life is left).

## Re-rendering

`rerender()` keeps the current screen in sync after a language change:

- On welcome, the daily result, or the normal result, it just re-renders them.
  The daily screen is detected by `#dailyShareBtn`.
- Mid-question, it re-renders the question and, if you'd already answered,
  restores the correct/wrong highlighting and the Next button.

## Timers and pause

`startTimer()` runs a 1-second `setInterval`; `stopTimer()` clears it. Opening
[Settings](../User/Settings.md) pauses the timer (`timerPaused`) and closing it
resumes if the question is still unanswered. The display turns red at ≤ 5
seconds.

Related: [Map Mode](Map-Mode.md) · [Data Model](Data-Model.md) ·
[Storage Keys](Storage-Keys.md) · [Daily Challenge](../User/Daily-Challenge.md)

## Explore

Explore bypasses `beginQuiz()` entirely: `startExplore()` dynamically imports
`explore.js`, mounts five untimed rounds, and retains its cleanup handle.
`stopExplore()` invalidates pending imports and destroys the session on quiz,
daily, welcome, or mode changes. Scoring uses `explore-math.js`; quiz lives,
length, streaks and Daily persistence are untouched. See [Explore](../User/Explore.md).

Explore verification (2026-10-28): production build and distance/scoring Node
checks pass. A temporary jsdom harness with actual Leaflet covered five rounds,
pin placement, reveal, replay, return to start, movement limits, failed movement,
renderer refresh and cancellation. All ten catalogue starts passed anonymous
metadata, SD JPEG, nearby panorama, and CORS checks with localhost and HTTPS
Origin headers. Browser UI access was unavailable: desktop/mobile visual and
WebGL checks, and a real deployed-origin playthrough remain manual checks. Nix
is unavailable locally; the dependency-cache/NAR hash calculation reproduced the
previous lockfile hash before calculating the replacement.
