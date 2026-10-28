# Command Line Internals

The command line is a Vim-style `:` prompt that can change nearly every setting
and answer questions. Users should read [Command Line](../User/Command-Line.md);
this page covers how it's implemented.

## The element

A single `<div id="cmdline">` is created in JS and appended to `<body>` once at
module load — it is **outside** `#app`, so it survives the app's full re-renders:

```js
const cmdline = document.createElement('div')
cmdline.id = 'cmdline'
cmdline.innerHTML = `
  <span class="cmdline-prompt" aria-hidden="true">:</span>
  <input class="cmdline-input" id="cmdlineInput" … />
  <span class="cmdline-message" id="cmdlineMessage" role="status" aria-live="polite"></span>
`
document.body.appendChild(cmdline)
```

It toggles `.visible` (shown), `.editing` (input focused), and `.has-message`
(showing a status line). Its position is set through `cmdline.dataset.position` by
`applyCmdlinePosition()`.

## Open and close

- `openCommandLine()` — remembers the previously focused element, clears state,
  focuses the input.
- `closeCommandLine()` — clears completion, hides, restores focus to the saved
  element if it still exists and isn't disabled.
- Global keys `:` and `Ctrl+P` open it; `Escape` and `Backspace`-on-empty close
  it.

## Parsing and dispatch

`runCommand(raw)` splits on whitespace:

```js
const [name = '', ...args] = raw.trim().split(/\s+/)
const arg = args.join(' ')
```

It then switches on the lowercased `name`. Commands are grouped by alias in the
`case` labels:

| Command(s) | Behaviour |
| --- | --- |
| `answer` / `a` | Answers the current question by letter; errors if no question, already answered, or invalid letter |
| `reset` | Wipes all `localStorage` settings |
| `daily` | `openDaily()`: starts today's Daily Challenge or shows the stored result |
| `font` | `findByName(FONTS, arg)` → `applyFont` |
| `theme` / `color` / `colorscheme` | `findByName(THEMES, arg)` → `applyTheme` |
| `cmdline` | `findByName(CMDLINE_POSITIONS, arg)` → `applyCmdlinePosition` |
| `variant` | `dark`, `light`, or `toggle` |
| `questions` / `corner` / `radius` / `options` | Parse an int and enforce the range |
| `lives` | Parse an int 1–10 → `applyLives` |
| `mode` / `gamemode` | `findByName(QUIZ_MODES, arg)` → `applyQuizMode` |
| `lang` / `language` | Match a locale by id or label → `applyLanguage` + `rerender` |
| `time` | `off`/`false`/`no`/`0`, `on`/`true`/`yes`, or seconds 5–60 |
| `lite` | `on`/`true`/`yes`, `off`/`false`/`no`, or `toggle`/empty → `applyLiteMode` |
| `''` | Empty → do nothing |
| default | Unknown command error |

`daily` takes no argument: it dispatches straight to `openDaily()` and reports
through the `cmd.daily` message. After changing something, commands report back
through `showCmdMessage(text)`. That sets the message text, toggles the `.error`
class, and clears it after 3 seconds. Messages are localized through the `cmd.*`
keys.

### Name matching

```js
const normalizeName = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

function findByName(list, query) {
  const q = normalizeName(query)
  if (!q) return null
  return list.find(item => normalizeName(item.id) === q || normalizeName(item.label) === q) || null
}
```

This strips accents and punctuation and lowercases, so `Türkçe` matches
`turkce`, `JetBrains Mono` matches `jetbrainsmono`, and so on. Matching is exact
(after normalization), which is why the [tab completion](#tab-completion) exists.

## Tab completion

`getCompletionItems(text)` returns `{ base, items }`:

- **No space yet** → complete the command name from `COMMAND_NAMES`, which
  includes `daily`, so `:dai` completes to the command.
- **Command + partial arg** → complete from the relevant registry (fonts,
  themes, positions, modes, languages, `time` values, `variant` values, `lite`
  values, or the available `answer` letters), filtering by `normalizeName`
  prefix.

`handleTab(backwards)` keeps a `completion` object with an index, cycles it, and
writes the selected `insert` value into the input. `renderCompletionMenu()`
draws a `<ul role="listbox">` (only when there are 2+ items) with a hint column
when the value and label differ.

## History

`cmdHistory` is an array of submitted inputs. `↑`/`↓` move `cmdHistoryPos`
through it, restoring `''` when you go past the newest entry. The history lives
for the page session only (not persisted).

## Focus and IME

The input's `keydown` handler calls `e.stopPropagation()` so global shortcuts
(such as `s` for Settings) don't fire while typing, and bails out when
`e.isComposing || e.keyCode === 229` so IME composition isn't interrupted.

Related: [Command Line](../User/Command-Line.md) · [Architecture](Architecture.md)

## Explore

The mode registry includes `explore`, so `:mode explore` and `:gamemode explore`
complete normally. Mode commands now use `switchMode()` so active sessions
restart and cancel Explore work consistently with selector buttons.
