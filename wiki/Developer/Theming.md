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
  --text-muted: #969dbd;
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
| `--text-muted` | Secondary text. Each palette tunes this so secondary text keeps at least a 4.5:1 contrast ratio against the surfaces it appears on (`--bg`, `--bg-card`, and `--bg-elev`), since it carries real UI labels, not just decoration. |
| `--primary` | Accent / active controls |
| `--accent` | Secondary accent |
| `--success` | Correct answers |
| `--error` | Wrong answers |
| `--warning` | Warnings |
| `--border` | Hairlines / outlines |

## Applying a theme

```js
function applyTheme(themeId, variant = themeVariant, persist = true) {
  const theme = getTheme(themeId)
  const resolved = resolveThemeVariant(theme, variant)
  themeVariant = resolved.variant
  currentThemeId = theme.id
  document.documentElement.setAttribute('data-theme', resolved.cssId)
  document.documentElement.setAttribute('data-variant', resolved.variant)
  if (persist) {
    localStorage.setItem('flag-quiz-theme', theme.id)
    localStorage.setItem('flag-quiz-theme-variant', resolved.variant)
  }
  syncVariantToggle()
  const select = document.getElementById('themeSelect')
  if (select) select.value = theme.id
  return theme
}
```

Two attributes are set:

- `data-theme` — the concrete palette (`tokyonight`, `latte`, …).
- `data-variant` — `dark` or `light`, for icon/contrast tweaks that aren't worth
  duplicating per palette.

`resolveThemeVariant` only honours `light` if the theme actually has a light
palette; otherwise it stays dark. `currentThemeId` tracks the applied theme so
`syncVariantToggle()` and `toggleThemeVariant()` don't have to re-read storage.

The third `persist` argument is `false` for the [theme gallery](#theme-gallery),
which live-previews a theme without committing it to `localStorage` until the
user confirms.

## Theme gallery

The full-screen gallery (`#themeGallery`, built in `main.js`) is opened by the
`t` key or the **Browse themes** button in Settings and handled by
`openThemeGallery()` / `closeThemeGallery(commit)`.

Each card is a `<button data-theme="…">`. Because the CSS palettes are keyed on
`[data-theme="…"]`, setting that attribute on the card scopes the palette
variables to it — so each card previews its own theme with no duplicated colour
values in JS. The card also carries `data-variant` and uses
`resolveThemeVariant(theme, themeVariant)`, so cards match the user's current
dark/light preference.

`layoutThemeStack()` positions the deck: each card gets inline `--x`, `--s`,
`--o`, `--blur`, `--bright`, and `z-index` custom properties derived from its
signed distance to the selection (`i - galleryIndex`), and CSS turns those into
a horizontal `translate`/`scale`/`opacity`/`filter` transform with a shared
easing. The step is derived from the card width and viewport so the strip adapts
from mobile to desktop. That is why depth and the shuffle are declarative rather
than another JS animation. Card and preview corner radii read the same
`--corner-radius` variable as the rest of the app, so the deck follows the
Corner radius setting.

`selectGalleryTheme(index, preview)` moves the selection, re-runs
`layoutThemeStack()`, and, when `preview` is true, calls
`applyTheme(id, themeVariant, false)`. `closeThemeGallery(true)` commits the
highlighted theme; `closeThemeGallery(false)` (Escape, close button) re-applies
the stored origin captured in `galleryOrigin` without persisting. The deck
follows the listbox pattern: a roving `aria-selected` on the options, an
`aria-activedescendant` on the stack, and `handleGalleryKey()` for arrows,
`Home`/`End`, `Enter`/`Space`, `Tab`, and `Escape`. The stack also cycles on
`wheel` and supports click-to-front / click-to-apply.

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

## Lite mode

Lite mode is a third attribute on `<html>`, `data-lite`, set by `applyLiteMode()`.
It changes no colour values; instead the `[data-lite="true"]` block at the end of
`style.css` neutralizes animations, transitions, gradient text, backdrop blur,
and shadows, and the `index.html` boot script skips the web-font `<link>`s (it
reads the same `localStorage` flag before the bundles load, so the loading screen
is already in the right mode). When you add a new effect or palette-dependent
decoration, make sure it degrades in that block. See
[Lite Mode](../User/Lite-Mode.md).

1. Add a `[data-theme="mytheme"] { … }` block in `style.css` with every variable.
2. Add an entry to `THEMES` in `main.js` with a unique `id`, a `label`, and the
   dark (and optional light) palette names.
3. Optionally add a light palette block and reference it as `light`.

Because the palette is selected by attribute, no JS logic beyond the registry
entry is needed.

Related: [Storage Keys](Storage-Keys.md) ·
[Themes and Fonts](../User/Themes-and-Fonts.md)

## Explore

Explore styles are lazy-loaded from `explore.css`. Its lite selectors disable
Leaflet and Explore animations, transitions, and shadows; map zoom and panorama
movement transitions are disabled in code. Lite uses flat photos, skipping
`explore-panorama.js` and Three.js. See [Explore](../User/Explore.md).

Explore buttons and map zoom controls use the active palette for backgrounds,
text, borders, hover and focus states. Guess, Continue and Retry use the primary
color; button rounding follows the corner-radius setting. No transitions are
added, so the same styles work in lite mode.

Explore actions use inline SVG icons with translated `title` and `aria-label`
attributes and 44-pixel touch targets. The taller photo stage contains a
responsive map thumbnail; its expand/shrink control resizes the same Leaflet
instance and calls `invalidateSize()`. Sizing changes have no transitions,
including in lite mode.

Photo credits use a native `details` disclosure with a themed information icon.
It starts collapsed and closes on photo changes to avoid location spoilers
from contributor names. Attribution remains accessible on demand; map attribution
stays visible. The disclosure adds no animation or extra network requests.
