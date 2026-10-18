# Developer wiki

Everything needed to understand, modify, and extend the code.

The whole app is plain JavaScript and CSS bundled by [Vite](https://vitejs.dev/).
There is **no framework** — just modules, render functions, and DOM APIs. If you
can read ES modules and a bit of CSS, you can work on this.

## Contents

- [Architecture](Architecture.md) — how the app is put together
- [Project Structure](Project-Structure.md) — what every file is for
- [Data Model](Data-Model.md) — the shape of a country, question, and option
- [Quiz Flow](Quiz-Flow.md) — from **Play** to the results screen
- [Map Mode](Map-Mode.md) — the world map, highlighting, and zoom
- [Localization](Localization.md) — adding or editing languages
- [Theming](Theming.md) — CSS variables, themes, and light/dark variants
- [Storage Keys](Storage-Keys.md) — every `localStorage` key
- [Command Line Internals](Command-Line-Internals.md) — the `:` command parser
- [Contributing](Contributing.md) — code style and how to contribute

## Quick orientation

- Entry point: `index.html` → `main.js`
- Logic: `main.js` (single module, sectioned with `// =====` comments)
- Styles: `style.css`
- Data: `public/data.json`, `public/world.svg`, `public/focus.json`
- Strings: `locales/*.json`

## Ground rules

- No frameworks, no build-time magic beyond Vite.
- No comments in the source unless they clarify something non-obvious.
- Every user-visible string comes from a locale file (see
  [Localization](Localization.md)).
- Commit after every logical change. Pull requests are welcome on GitHub (see
  [Contributing](Contributing.md)).

Related: [User wiki](../User/README.md) · [Hoster wiki](../Hoster/README.md)
