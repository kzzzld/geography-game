# Keyboard Shortcuts

You can play and configure the whole game without touching the mouse.

## Global

| Key | Action |
| --- | --- |
| `:` | Open the [command line](Command-Line.md) |
| `Ctrl` + `P` | Open the command line (alternative) |
| `s` / `S` | Open [Settings](Settings.md) |
| `t` / `T` | Open the theme gallery (preview and switch themes) |
| `Escape` | Close Settings, the theme gallery, or the command line |
| `Enter` | **Next** after answering, or start the quiz from the results screen |

Shortcuts are ignored while a text field, select, or textarea has focus, so you
can type freely in Settings and the command line.

## Answering a question

| Key | Action |
| --- | --- |
| `1`–`9` | Select option 1–9 |
| `0` | Select option 10 |
| `a`–`h` | Select option A–H (case-insensitive) |
| `↑` / `↓` | Move focus between answer buttons |

The number keys cover all ten possible options. The letter keys cover the first
eight; for options nine and ten use `9` and `0`, or the command line's
`answer` command, which accepts any letter label.

Answer keys only work **before** you've answered. Once an option is chosen every
button is disabled until you advance.

## Settings dialog

Settings traps focus while open:

- `Tab` / `Shift`+`Tab` cycle through the focusable controls.
- `Escape` closes it.

## Theme gallery

Press `t` from anywhere (or the **Browse themes** button next to the theme
dropdown in Settings) to open the full-screen theme gallery — a stacked deck of
theme cards where the selected theme sits in front and previews its own palette.

| Key | Action |
| --- | --- |
| `↑` `↓` `←` `→` | Move through the deck and live-preview that theme |
| `Home` / `End` | Jump to the first / last theme |
| `Enter` / `Space` | Apply the highlighted theme and close |
| `Tab` | Move focus between the deck and the close button |
| `Escape` | Close and restore the theme you started with |

You can also scroll the mouse wheel to move through the deck. Clicking a card
that is behind brings it to the front; clicking the front card applies it.
Nothing is saved until you confirm; abandoning the gallery restores the previous
theme.

Details in [Themes and Fonts](Themes-and-Fonts.md#the-theme-gallery).

## Command line

| Key | Action |
| --- | --- |
| `Tab` / `Shift`+`Tab` | Cycle autocomplete suggestions |
| `↑` / `↓` | Browse command history |
| `Backspace` (on empty) | Close the command line |
| `Enter` | Run the command |
| `Escape` | Close without running |

Details in [Command Line](Command-Line.md).

Related: [Playing a Quiz](Playing-a-Quiz.md) · [Command Line](Command-Line.md)
