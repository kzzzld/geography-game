# Playing a Quiz

A complete walk-through of what happens from the first question to the results
screen.

## Starting

Press **Play** on the welcome screen. If a mode button was changed while a quiz
was running, the quiz restarts with the new mode. Starting a quiz:

1. Shuffles the full country pool.
2. Takes as many as your **questions per quiz** setting allows (default 20).
3. For each one, builds a question with randomly chosen wrong options.

Flag and map images for the whole quiz are preloaded in the background, so later
questions don't stall.

## The score bar

Above the question card sits the score bar:

- **Question x / y** — your position in the quiz.
- **Timer** — only shown when [timed mode](#timed-mode) is on; turns red at 5
  seconds or fewer.
- **Streak flame** — your current run of correct answers; it glows once the
  streak reaches 3.
- **Score** — correct answers so far, shown as `score / questions seen`.

## Answering

Each question shows a prompt and a set of multiple-choice options, each labelled
with a letter (`A`, `B`, `C`, …).

- **Mouse:** click an option.
- **Keyboard:** press `1`–`9` or `0` for the first ten options, or `a`–`h`.
- **Arrow keys:** move focus between options with `↑` / `↓`, then `Enter`/`Space`.

Once you answer, every option is locked. The correct one is outlined in green; if
you picked wrong, your choice is outlined in red. Your score and streak update
immediately.

You can't change an answer after submitting it.

## Advancing

Press **Next** (or `Enter`). On the final question the button reads **See
Results**. `Enter` also triggers it as long as focus isn't on another button.

## Timed mode

Enable it from the clock button in the top bar. When it's on:

- Each question gets a countdown (default **15 seconds**, adjustable 5–60 from
  the popover next to the clock button).
- The timer is **paused while the Settings dialog is open** and resumes when you
  close it (if the question is still unanswered).
- If time runs out, the question is marked as missed, your streak resets, the
  correct answer is revealed, and you can continue.

Scoring is worth more in timed mode — see
[Scoring and Streaks](Scoring-and-Streaks.md).

## Infinite mode

[Infinite](Game-Modes.md#infinite) is a game mode, not a setting: pick it from the
top bar (or `:mode infinite`) and you get an endless Flag → Country run instead
of a fixed-length quiz.

- You start with your configured number of **lives** (1–10, default 3, set in
  [Settings](Settings.md#gameplay)).
- A correct answer keeps the run going; a wrong answer or timeout costs one life.
- The score bar shows a heart counter with your remaining lives — it pulses when
  you're down to your last one. The question label drops the total and reads just
  `Question N`.
- Questions are drawn at random **with** replacement, so the same flag can come
  round again.
- The run ends the moment lives reach zero, then the results screen appears.

Infinite also works with [timed mode](#timed-mode): let the clock run out and you
lose a life.

## The results screen

When the last question is done you see:

- **Final score** as `correct / total`.
- **Accuracy** as a percentage.
- **Best streak** (all-time), if it's above zero.
- **Points and time** — only when timed mode was on.
- How many questions you **missed**.

Two buttons are offered:

- **Retry Missed (n)** — starts a new quiz made only of the questions you got
  wrong, each rebuilt with fresh, reshuffled options. Shown only if you missed
  anything.
- **Play Again** — starts a brand-new quiz in the current mode.

## While you play

- Press `s` (or click the gear) to open [Settings](Settings.md) at any time;
  the quiz is not reset.
- Press `:` (or `Ctrl+P`) to open the [command line](Command-Line.md).
- Switching the game mode from the top bar restarts the quiz.

Related: [Scoring and Streaks](Scoring-and-Streaks.md) ·
[Settings](Settings.md) · [Keyboard Shortcuts](Keyboard-Shortcuts.md)
