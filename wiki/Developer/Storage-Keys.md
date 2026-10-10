# Storage Keys

All persistence uses `localStorage` under the `flag-quiz-` prefix. There is no
server and no cookies, so clearing your browser storage resets the game.

Every key is written by an `apply*` function right after a setting changes, and
read back by a matching `load*` function at startup. Invalid or out-of-range
values are clamped or replaced with defaults.

## Keys

| Key | Stores | Default | Read by |
| --- | --- | --- | --- |
| `flag-quiz-theme` | Theme id (`tokyonight`, `nord`, …) | `tokyonight` | `loadTheme()` |
| `flag-quiz-theme-variant` | `dark` or `light` | `dark` | `applyStoredTheme()` |
| `flag-quiz-font` | Font id (`iosevka`, `inter`, …) | `iosevka` | `loadFont()` |
| `flag-quiz-corner-padding` | px, 0–48 | `32` | `loadCornerPadding()` |
| `flag-quiz-corner-radius` | px, 0–48 | `0` | `loadCornerRadius()` |
| `flag-quiz-cmdline-position` | `center` / `top` / `bottom` | `center` | `loadCmdlinePosition()` |
| `flag-quiz-questions-per-quiz` | integer, 5–50 | `20` | `loadQuestionsPerQuiz()` |
| `flag-quiz-options-count` | integer, 2–10 | `5` | `loadOptionsCount()` |
| `flag-quiz-best-streak` | integer ≥ 0 | `0` | `loadBestStreak()` |
| `flag-quiz-mode` | `flag` / `country` / `capital` / `map` / `mixed` | `flag` | `loadQuizMode()` |
| `flag-quiz-timer-enabled` | `"true"` / `"false"` | `false` | `loadTimerEnabled()` |
| `flag-quiz-timer-seconds` | integer, 5–60 | `15` | `loadTimerSeconds()` |
| `flag-quiz-language` | Locale id (`en`, `tr`) | browser-detected | `loadLanguage()` |

## Validation

- **Number keys** are parsed with `parseInt` and clamped with `Math.min`/`Math.max`
  to their range. A missing value returns the default; a non-numeric one is
  treated as the default.
- **Enum keys** (`theme`, `mode`, `cmdline-position`, `font`, `language`) fall
  back to the default if the stored value isn't recognized.
- **`flag-quiz-theme`** also accepts legacy *palette* names such as `mocha` or
  `latte` and maps them back to their theme id — see [Theming](Theming.md).
- **`flag-quiz-best-streak`** must be a finite number greater than zero,
  otherwise `0`.

## `:reset`

The command-line `reset` command removes every key above, then re-applies
defaults from scratch via `resetApp()`:

```js
function resetApp() {
  localStorage.removeItem('flag-quiz-theme')
  localStorage.removeItem('flag-quiz-theme-variant')
  // … all keys …
  applyStoredTheme()
  applyFont(loadFont())
  // … re-apply every default …
  showWelcome()
}
```

Note that after removal the `load*` functions return defaults, so the game is
fully reset — including the saved best streak.

Related: [Theming](Theming.md) · [Settings](../User/Settings.md)
