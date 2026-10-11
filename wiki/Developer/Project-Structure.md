# Project Structure

What every file in the repository is for.

```
.
├── AGENTS.md               # Instructions for AI agents (wiki-sync rules)
├── PRODUCT.md              # Captured product context (users, purpose, positioning)
├── index.html              # App shell: #loader (loading screen + critical CSS), #app div, font <link>s, loads main.js
├── main.js                 # Entire app logic (see note below)
├── style.css               # All styles and theme palettes
├── vite.config.js          # Vite dev-server config (allowedHosts)
├── package.json            # Scripts and the single dev dependency (Vite)
├── locales/
│   ├── en.json             # English UI strings + country/capital names
│   └── tr.json             # Turkish strings + country/capital names
├── public/                 # Copied verbatim into the build output
│   ├── data.json           # The country pool (207 entries)
│   ├── world.svg           # World map, 250 paths keyed by ISO alpha-2
│   ├── focus.json          # Per-country [x,y,w,h] focus rectangles
│   ├── favicon.svg / favicon-32.png / favicon.ico / apple-touch-icon.png
│   └── vite.svg
├── flake.nix               # Nix flake: dev shell, package, NixOS module
├── flake.lock
├── compose.yml             # Docker Compose service (untested)
├── Dockerfile              # node build → nginx serve (untested)
├── .dockerignore
├── LICENSE                 # MIT
├── dist/                   # Build output (generated)
├── wiki/                   # This documentation
└── node_modules/           # (generated)
```

## `main.js`

One file, ~1600 lines, organised into sections separated by `// ===== Name =====`
banner comments. In order:

| Section | Responsibility |
| --- | --- |
| Localization | Locale discovery, `t()`, `countryName()`, `capitalName()`, `countryCode()` |
| Theme management | Theme registry, apply/load/toggle variant |
| Font management | Font registry and application |
| Corner padding / radius | Numeric appearance settings |
| Questions per quiz / Answer options | Quiz-size settings |
| Streak management | Best streak persistence and record detection |
| Quiz mode management | Mode registry and active mode |
| Language management | Active language + browser detection |
| Timer management | Timed-mode enable/seconds |
| Command line position management | Where `:` appears |
| Shuffle utility | Fisher–Yates `shuffle()` |
| Build quiz questions | `buildQuestion()`, `buildQuiz()` |
| Number input max guard | Clamp `.number-input` values on input |
| Settings modal | `renderSettingsModal()`, open/close, focus trap |
| Vim-style command line | `runCommand()` and friends |
| Tab completion | `getCompletionItems()`, `handleTab()` |
| Global keyboard controls | The document-level `keydown` listener |
| Render header | Logo, controls, mode switch, timer, settings |
| Timer | Start/stop/display/handle-timeout |
| Render question | Prompt + options + score bar |
| Handle answer selection | Scoring, streak, feedback classes |
| Handle next | Advance or finish |
| Render result | Results screen |
| Rerender current view | Re-render after language change |
| Welcome screen | ASCII map + Play |
| Start quiz | `beginQuiz()`, `startQuiz()`, `retryMissed()` |
| Loading screen | Progress, font/map preload, skip |
| Init | Apply saved settings, fetch data, preload, show welcome |

Constants live near their section, or at the top (`THEMES`, `FONTS`,
`QUIZ_MODES`, `CMDLINE_POSITIONS`, `LETTERS`, `WELCOME_ASCII`).

## `public/` vs `locales/`

- **`public/`** files are served as-is and fetched at runtime with relative URLs
  (`./data.json`, `./world.svg`, `./focus.json`). Put anything the browser must
  request by URL here.
- **`locales/`** files are *bundled* at build time via `import.meta.glob`, not
  fetched. They are imported as JS objects, so their paths are resolved by Vite
  and can't be constructed dynamically.

## `style.css`

Starts with all theme palettes (`[data-theme="…"]` blocks of CSS variables),
then base/reset styles, layout, and component styles. See
[Theming](Theming.md).

The loading-screen styles are the one exception: they live inline in
`index.html` so the screen can paint before this stylesheet loads. See
[Architecture](Architecture.md).

Related: [Architecture](Architecture.md) · [Data Model](Data-Model.md)
