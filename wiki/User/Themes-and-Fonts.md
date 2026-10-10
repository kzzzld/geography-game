# Themes and Fonts

Make the game look the way you like. Both themes and fonts are switched from
[Settings](Settings.md) or the [command line](Command-Line.md), and remembered
between sessions.

## Theming model

Themes are driven entirely by CSS custom properties (`--bg`, `--text`,
`--primary`, …) on the `<html>` element via a `data-theme` attribute. Switching a
theme just swaps that attribute — no reload, no re-render of the quiz.

Two attributes are set:

- `data-theme` — the concrete palette id (e.g. `tokyonight`, `latte`).
- `data-variant` — always either `dark` or `light`, used for icon/contrast
  tweaks.

## The six themes

Each theme ships a dark and a light palette. Use the moon/sun button in the top
bar (or `:variant toggle`) to flip between them.

| Theme | Dark palette | Light palette |
| --- | --- | --- |
| **Tokyo Night** | `tokyonight` | `tokyonight-day` |
| **Nord** | `nord` | `nord-light` |
| **Dark** | `dark` | `light` |
| **AMOLED** | `amoled` | `amoled-light` |
| **Catppuccin** | `mocha` | `latte` |
| **Black Metal** | `blackmetal` | `blackmetal-light` |

Notes:

- **Tokyo Night** is the default, and also the fallback used before any theme is
  chosen (the `:root` palette equals `tokyonight`).
- **AMOLED** is true black (`#000000`) in dark mode — good for OLED screens.
- Legacy stored values are migrated: if an old palette id like `mocha` or
  `latte` is found, it's mapped back to its theme (Catppuccin).

The moon/sun button is disabled only when the current theme has no light
variant; every built-in theme currently provides one.

## The seven fonts

The selected font is applied through the `--font-family` CSS variable. Iosevka
is the default.

| Font | Kind |
| --- | --- |
| **Inter** | Sans-serif |
| **JetBrains Mono** | Monospace |
| **Iosevka** | Monospace (default) |
| **Fira Code** | Monospace |
| **IBM Plex Mono** | Monospace |
| **Source Code Pro** | Monospace |
| **Roboto Mono** | Monospace |

Fonts are loaded from Google Fonts and jsDelivr (for Iosevka) in `index.html`, so
the first load needs network access.

## Switching quickly

```
:theme catppuccin
:theme nord
:color amoled
:variant toggle
:font jetbrains
```

Fuzzy matching is supported: `:theme cat` resolves to Catppuccin. Tab completion
lists the options.

Related: [Settings](Settings.md) · [Command Line](Command-Line.md) ·
[Theming](../Developer/Theming.md)
