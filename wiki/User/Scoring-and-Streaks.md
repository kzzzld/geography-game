# Scoring and Streaks

There are two different numbers in play: your **score** and, in timed mode, your
**points**. This page explains both, plus how streaks work.

## Score

Your score is simply the **number of correct answers** so far.

- Displayed as `score / questions seen` in the score bar.
- The final result screen shows `score / total` (all questions in the quiz).
- Accuracy is `round(score / total * 100)` as a percentage.

Every question counts equally; there is no penalty for a wrong answer or a
timeout beyond not gaining the point.

## Points (timed mode only)

When [timed mode](Playing-a-Quiz.md#timed-mode) is enabled, correct answers also
award points based on how fast you answered:

```
points += 100 + (seconds remaining) × 10
```

- The base is **100** points.
- Each leftover second is worth **10** points.
- With the default 15-second timer, a near-instant correct answer is worth about
  250 points.

Points are shown only on the results screen, alongside the total elapsed time
formatted as `m:ss`. They reset to zero at the start of every quiz.

## Streaks

The **streak** is your current run of consecutive correct answers.

- It increments on each correct answer and resets to `0` on any wrong answer or
  timeout.
- The flame icon in the score bar shows the current streak and gets a "hot" glow
  once you reach **3**.
- Each correct answer gives the flame a little bump animation; if you pass your
  all-time best mid-quiz, you get a small particle burst instead.
- Every 5th correct answer in a row (**5, 10, 15, 20, …**) triggers a big
  screen-wide milestone celebration in the middle of the page — the count, a
  flame, an expanding ring, and a confetti burst.
- Animations are suppressed if your system requests reduced motion, and in
  [lite mode](Lite-Mode.md).

### Best streak

Your **best streak** is the longest run you've ever achieved, saved between
sessions in `localStorage` (key `flag-quiz-best-streak`).

- It updates the moment you beat it, not just at the end of a quiz.
- The all-time best is shown on the results screen when it's above zero.
- To reset it, use the [command line](Command-Line.md) command `:reset`, which
  clears all saved preferences including the best streak.

## Reset vs. restart

- **Play Again / Retry Missed** start a fresh quiz but keep your best streak.
- `:reset` wipes every stored setting back to defaults — theme, font, language,
  mode, questions, options, timer, best streak, and more.

Related: [Playing a Quiz](Playing-a-Quiz.md) · [Command Line](Command-Line.md)
