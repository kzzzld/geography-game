# Settings

Open Settings with the gear icon in the top bar or by pressing `s`. The dialog
is organised into four categories. Everything you change is saved immediately to
`localStorage`.

Close it with the ✕ button, `Escape`, or by clicking the backdrop. Focus returns
to whatever you had selected before.

## General

| Setting | Choices | Default | Notes |
| --- | --- | --- | --- |
| **Language** | English, Türkçe | Detected from your browser, else English | Changing it re-renders the screen immediately and closes the dialog |
| **Lite mode** | On / Off | Off | Turns off animations, effects, and font/map preloading for slow computers or connections. Marked **Refresh Needed** — see [Lite Mode](Lite-Mode.md). Also toggleable from the loading screen or `:lite` |

More languages can be added by dropping a file into `locales/` — see
[Localization](../Developer/Localization.md).

## Appearance

| Setting | Range / choices | Default | Notes |
| --- | --- | --- | --- |
| **Font** | 7 fonts | Iosevka | See [Themes and Fonts](Themes-and-Fonts.md) |
| **Theme** | 6 themes | Tokyo Night | Also switchable from the full-screen [theme gallery](Themes-and-Fonts.md#the-theme-gallery) via the **Browse themes** button or by pressing `t`. See [Themes and Fonts](Themes-and-Fonts.md) |
| **Full country names** | On / Off | Off | When on, shows official long-form names (e.g. *Democratic People's Republic of Korea*) in prompts and answer options instead of the short names. Applies immediately |
| **Corner radius** | 0–48 px | 0 | Rounds the corners of cards and buttons |
| **Corner padding** | 0–48 px | 32 | Inset from the viewport edges |

Numbers are clamped to their range as you type.

## Gameplay

| Setting | Range | Default | Notes |
| --- | --- | --- | --- |
| **Questions per quiz** | 5–50 | 20 | Marked **Refresh Needed** — applies to the *next* quiz |
| **Answer options** | 2–10 | 5 | Marked **Refresh Needed** — applies to the *next* quiz |

Both show a small **Refresh Needed** note because changing them doesn't rebuild
the quiz already on screen; start a new quiz (or switch mode) to apply them.

The answer-option maximum of 10 matches the ten letter labels (`A`–`J`) the game
supports.

## Interface

| Setting | Choices | Default | Notes |
| --- | --- | --- | --- |
| **Command line position** | Center, Top, Bottom | Center | Where the `:` command line appears |

## Timed mode

Timed mode is **not** in the Settings dialog — it has its own clock button in the
top bar. Click it to toggle, and use the number field in its popover to set
**seconds per question** (5–60, default 15). See
[Playing a Quiz](Playing-a-Quiz.md#timed-mode).

## Changing settings without the dialog

The [command line](Command-Line.md) can change most of these too, e.g.
`:theme nord`, `:font inter`, `:questions 10`, `:corner 24`, `:radius 8`,
`:options 4`, `:lang tr`, `:variant toggle`, `:lite on`, or `:time 30`.

Related: [Lite Mode](Lite-Mode.md) · [Themes and Fonts](Themes-and-Fonts.md) ·
[Command Line](Command-Line.md) · [Keyboard Shortcuts](Keyboard-Shortcuts.md)
