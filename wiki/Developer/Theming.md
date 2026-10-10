# Theming

Themes are pure CSS custom properties toggled by an attribute on `<html>`. No
CSS is generated at runtime and no styles are injected by JS.

## The theme registry

```js
const THEMES = [
  { id: 'tokyonight',  label: 'Tokyo Night', dark: 'tokyonight',      light: 'tokyonight-day' },
  { id: 'nord',        label: 'Nord',        dark: 'nord',            light: 'nord-light' },
  { id: 'dark',        label: 'Dark',        dark: 'dark',            light: 'light' },
  { id: 'amoled',      label: 'AMOLED',      dark: 'amoled',          light: 'amoled-light' },
  { id: 'catppuccin',  label: 'Catppuccin',  dark: 'mocha',           light: 'latte' },
  { id: 'blackmetal',  label: 'Black Metal', dark: 'blackmetal',      light: 'blackmetal-light' },
]
```

Each entry maps a stable `id` (what's stored and shown) to the concrete palette
names used in CSS for dark and light. All six currently define both.

## CSS palettes

`style.css` opens with a `[data-theme="…"]` block per palette, each defining the
same variables:

```css
[data-theme="tokyonight"] {
  --bg: #1a1b26;
  --bg-card: #24283b;
  --bg-elev: #2f334d;
  --text: #c0caf5;
  --text-muted: #565f89;
  --primary: #7aa2f7;
  --accent: #bb9af7;
  --success: #9ece6a;
  --error: #f7768e;
  --warning: #e0af68;
  --border: #3b4261;
}
```

The `:root` selector shares the Tokyo Night block, so Tokyo Night is the default
and the pre-JS fallback.

| Variable | Used for |
| --- | --- |
| `--bg` | Page background |
| `--bg-card` | Cards / quiz surface |
| `--bg-elev` | Elevated surfaces (modals, popovers) |
| `--text` | Primary text |
| `--text-muted` | Secondary text |
| `--primary` | Accent / active controls |
| `--accent` | Secondary accent |
| `--success` | Correct answers |
| `--error` | Wrong answers |
| `--warning` | Warnings |
| `--border` | Hairlines / outlines |

## Applying a theme

```js
function applyTheme(themeId, variant = themeVariant) {
  const theme = getTheme(themeId)
  const resolved = resolveThemeVariant(theme, variant)
  themeVariant = resolved.variant
  document.documentElement.setAttribute('data-theme', resolved.cssId)
  document.documentElement.setAttribute('data-variant', resolved.variant)
  localStorage.setItem('flag-quiz-theme', theme.id)
  localStorage.setItem('flag-quiz-theme-variant', resolved.variant)
  syncVariantToggle()
  return theme
}
```

Two attributes are set:

- `data-theme` — the concrete palette (`tokyonight`, `latte`, …).
- `data-variant` — `dark` or `light`, for icon/contrast tweaks that aren't worth
  duplicating per palette.

`resolveThemeVariant` only honours `light` if the theme actually has a light
palette; otherwise it stays dark.

## Light/dark toggle

`toggleThemeVariant()` flips between the theme's dark and light palettes and is
wired to the moon/sun button (`#variantToggle`). `syncVariantToggle()` keeps the
button's `aria-pressed`, `title`, and disabled state in sync. It's disabled only
when the current theme has no light palette.

## Legacy migration

Older versions stored the raw palette name (`mocha`, `tokyonight-day`,
`light`, …). `loadTheme()` / `applyStoredTheme()` detect a stored value that
matches some theme's `dark` or `light` field and map it back to the theme `id`.
This keeps old `localStorage` working after the theme model changed.

## Fonts

Fonts are applied via a separate variable, `--font-family`, by `applyFont()`:

```js
document.documentElement.style.setProperty('--font-family', font.family)
```

Defaults to Iosevka. The seven families are listed in `FONTS` in `main.js` and
loaded via `<link>`s in `index.html`.

## Adding a theme

1. Add a `[data-theme="mytheme"] { … }` block in `style.css` with every variable.
2. Add an entry to `THEMES` in `main.js` with a unique `id`, a `label`, and the
   dark (and optional light) palette names.
3. Optionally add a light palette block and reference it as `light`.

Because the palette is selected by attribute, no JS logic beyond the registry
entry is needed.

Related: [Storage Keys](Storage-Keys.md) ·
[Themes and Fonts](../User/Themes-and-Fonts.md)
