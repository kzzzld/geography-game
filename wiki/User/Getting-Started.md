# Getting Started

Welcome! This page takes you from opening the game to finishing your first
quiz. No account, no install — it runs entirely in your browser.

## Open the game

- **Hosted:** open the URL your host provides (e.g. `https://geog.example.com`).
- **Local development:** run `npm run dev` and open
  [http://localhost:5173](http://localhost:5173) — see the
  [Hoster wiki](../Hoster/README.md) for build details.

## The welcome screen

The first thing you see is the welcome screen:

- An ASCII world map drawn as text.
- A **Play** button.
- A hint telling you to pick a mode first.

The map credit — *"Map (C) 1998 Matthew Thomas. Freely usable if this line is
included."* — is shown below it.

## Pick a game mode

The top bar has five buttons, one per [game mode](Game-Modes.md):

| Button | Quiz type |
| --- | --- |
| Flag | Show a flag, guess the country |
| Country | Show a country name, guess the flag |
| Capital | Show a capital, guess the country |
| Map | Show a map, guess the country |
| Mixed | Random mix of the four above |

**Flag → Country** is selected by default. Click any button to switch; if a quiz
is already running, switching restarts it with the new mode.

## Play

1. Press **Play** (or just press `Enter` while the button is focused).
2. Read the prompt and click an answer, or use the keyboard — `1`–`9`, `0`
   (for the tenth option), or `a`–`h`.
3. After answering, the correct option turns green and a wrong pick turns red.
4. Press **Next** (or `Enter`) to continue.
5. On the last question the button becomes **See Results**.

## What you can change

Almost everything lives behind the gear icon (or press `s`):

- Language, theme, font, corner padding and radius.
- Questions per quiz and number of answer options.
- Where the
  [Vim-style command line](Command-Line.md) appears.

See [Settings](Settings.md) for the full list. Your choices are remembered for
next time using your browser's `localStorage`.

## Next steps

- [Game Modes](Game-Modes.md) — how each mode quizzes you
- [Playing a Quiz](Playing-a-Quiz.md) — the full run-through
- [Scoring and Streaks](Scoring-and-Streaks.md) — what the numbers mean
