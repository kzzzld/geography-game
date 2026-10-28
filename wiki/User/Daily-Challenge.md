# Daily Challenge

A once-a-day quiz that is **the same for everyone**. The date is taken in UTC,
so two players in different time zones answering on the same UTC day get the
exact same 20 flags in the exact same order with the exact same options.

- **20 questions**, always **Flag → Country**.
- **5 answer options** per question.
- **Never timed** — there is no clock, and no per-question countdown.
- The daily ignores your quiz-length, options-per-question, and timed-mode
  settings; it is fixed at 20 / 5 / untimed regardless of how you have the
  [normal modes](Game-Modes.md) configured.

The Daily Challenge is **not** one of the eight game modes — see
[Game Modes](Game-Modes.md) for those.

## Playing it

Open the daily from the welcome screen: the **Daily Challenge** card shows the
current date, a one-line status, and a button. Before you've played it that day
the button reads **Play Daily Challenge**; pressing it starts the run. You can
also start it from the [command line](Command-Line.md) with `:daily`.

It is **once per day**. As soon as you finish the run the result is recorded, and
the card switches to showing that result — its button then reads **See your
result** instead of starting a fresh run. Re-opening the daily (from the card or
from `:daily`) shows the stored result rather than letting you replay it. The
lock resets when the UTC date rolls over.

## The result screen

When the last question is answered the daily ends on its own result screen,
separate from the normal results screen. It shows:

- A **Daily Challenge** badge and the date (localized to your language).
- Your **score** as `correct / total` and your **accuracy** as a percentage.
- A **grid of 20 cells**, one per question, green for correct and red for wrong.
  Hovering a cell shows which question it was and whether you got it right.
- Your **run time**.
- Either **New personal best!** or your current personal-best line.
- Two buttons: **Save as image** and **Play Again**.

**Play Again** starts an ordinary quiz in the current mode — it does not replay
the daily.

## Personal bests

Your daily best is tracked separately from the once-per-day result, so you can
keep improving across days.

- A **higher score** wins.
- If two runs score the same, the **faster time** wins.

The best line records the score, the time, and the date of the run that set it.
It appears on the welcome card and on the result screen (unless that run just set
a new record, in which case you see the "New personal best!" line instead).

## Save as image

**Save as image** draws a square (1080×1080) share card on a canvas — using your
active theme's colours and font — with the app name, the date, your score and
accuracy, the 20-cell grid, and your personal best. It downloads the PNG as
`geography-daily-<date>.png`, ready to share. A status line under the buttons
reports **Image saved** or the failure message if the image couldn't be created.

## Storage

The daily keeps its own `localStorage` keys, separate from settings and the
normal quiz records:

- `flag-quiz-daily-result` — today's finished run.
- `flag-quiz-daily-best` — your personal best.

Both are cleared by the command-line `:reset`, along with every other stored
setting and record.

Related: [Game Modes](Game-Modes.md) · [Playing a Quiz](Playing-a-Quiz.md) ·
[Command Line](Command-Line.md)
