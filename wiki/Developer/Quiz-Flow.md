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

## 1. Boot

`init()` (last line of `main.js`):

1. Applies every stored setting via `apply(load())`.
2. `await fetch('./data.json')` into `countries`.
3. Calls `showWelcome()`.
4. On fetch failure, renders the `error.loadFailed` message.

## 2. Starting

`startQuiz()` calls `beginQuiz(buildQuiz())`. `buildQuiz()` shuffles the pool,
takes `questionsPerQuiz`, and builds each question.

`beginQuiz(questions)` resets all per-quiz state:

```js
quizQuestions = questions
missedQuestions = []
currentIndex = 0
score = 0
points = 0
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
- On wrong: pushes the question to `missedQuestions`, resets the streak.
- Marks all buttons disabled, adds `.correct` / `.wrong` classes.
- Calls `updateScoreBar()`, `animateStreak()` on a correct answer, and
  `revealNext()`.

`handleTimeout()` is the same ending when the timer hits zero, except there is no
selected answer and the question is always counted as missed.

## 5. Advancing

`revealNext()` shows `#nextBtn` and labels it **Next** or **See Results**
depending on position. `handleNext()` increments `currentIndex` and either
renders the next question or `renderResult()`.

## 6. Results

`renderResult()` computes accuracy and elapsed time:

- Accuracy = `round(score / total * 100)`.
- Time = `(Date.now() - quizStartTime)` formatted `m:ss`.
- Shows best streak and (timed only) points + time, and the missed count.
- Buttons: **Retry Missed** (only if anything was missed) and **Play Again**.

## 7. Retry

`retryMissed()` maps `missedQuestions` through `buildQuestion(q.country, q.mode)`
— same prompt modes, new wrong options — and calls `beginQuiz()` again.

## Re-rendering

`rerender()` keeps the current screen in sync after a language change:

- On welcome / results, it just re-renders them.
- Mid-question, it re-renders the question and, if you'd already answered,
  restores the correct/wrong highlighting and the Next button.

## Timers and pause

`startTimer()` runs a 1-second `setInterval`; `stopTimer()` clears it. Opening
[Settings](../User/Settings.md) pauses the timer (`timerPaused`) and closing it
resumes if the question is still unanswered. The display turns red at ≤ 5
seconds.

Related: [Map Mode](Map-Mode.md) · [Data Model](Data-Model.md) ·
[Storage Keys](Storage-Keys.md)
