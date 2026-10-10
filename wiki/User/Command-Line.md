# Command Line

The game has a built-in **Vim-style command line** for power users. Open it with
`:` or `Ctrl`+`P`, type a command, and press `Enter`.

The line is shown as `:` followed by your input, and a small status message
appears for a few seconds after each command. You can move it to the top, center,
or bottom from [Settings](Settings.md) (or `:cmdline`).

## Commands

| Command | Aliases | What it does |
| --- | --- | --- |
| `answer <a–j>` | `a` | Answer the current question with the given letter |
| `mode <mode>` | `gamemode` | Switch [game mode](Game-Modes.md) (`flag`, `country`, `capital`, `map`, `mixed`) |
| `theme <name>` | `color`, `colorscheme` | Switch theme |
| `variant <dark\|light\|toggle>` | | Set or toggle the light/dark palette |
| `font <name>` | | Switch font |
| `lang <code>` | `language` | Switch language (`en`, `tr`, …) |
| `time <off\|5–60>` | | Turn timed mode off, on, or set seconds per question |
| `questions <5–50>` | | Set questions per quiz (takes effect next quiz) |
| `options <2–10>` | | Set number of answer options (takes effect next quiz) |
| `corner <0–48>` | | Set corner padding in pixels |
| `radius <0–48>` | | Set corner radius in pixels |
| `cmdline <center\|top\|bottom>` | | Move the command line |
| `reset` | | Wipe **all** saved settings back to defaults |

## Fuzzy matching

Names are matched loosely — case, accents, and punctuation are ignored. So all of
these work:

```
:theme cat          → Catppuccin
:font jet           → JetBrains Mono
:mode cap           → Capital → Country
:lang turkish       → Türkçe (matched by label)
```

## Tab completion

Type a partial command or argument and press `Tab` to cycle suggestions. The menu
shows the value plus a hint when they differ. `Shift`+`Tab` cycles backwards.

- Commands complete from the full list.
- Arguments complete from the relevant set (themes, fonts, modes, languages, …).
- `answer` completes the available option letters for the current question.

## History

Use `↑` / `↓` to browse previously run commands.

## Examples

```
:time 30
:theme nord
:variant toggle
:questions 25
:options 4
:mode mixed
:lang tr
:reset
```

Errors (bad name, out-of-range number) show a red message and change nothing.

Related: [Keyboard Shortcuts](Keyboard-Shortcuts.md) ·
[Command Line Internals](../Developer/Command-Line-Internals.md)
