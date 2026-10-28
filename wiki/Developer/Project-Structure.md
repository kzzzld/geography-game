# Project Structure

What every file in the repository is for.

```
.
├── AGENTS.md               # Instructions for AI agents (wiki-sync rules)
├── PRODUCT.md              # Captured product context (users, purpose, positioning)
├── index.html              # App shell: boot script (sets data-lite, injects font <link>s unless lite), #loader (loading screen + critical CSS), #app div, loads main.js
├── main.js                 # Quiz and settings logic (see note below)
├── explore.js              # Lazy Explore session, Leaflet map and Panoramax requests
├── explore-panorama.js     # Lazy Photo Sphere Viewer / Three.js
├── explore-math.js         # Great-circle distance, scoring and validation
├── explore-math.test.js    # Dependency-free Node verification
├── explore-spawns.json     # Verified panoramic catalogue
├── explore.css             # Lazy Explore layout and lite overrides
├── style.css               # Core styles and theme palettes
├── vite.config.js          # Vite dev-server config (allowedHosts)
├── package.json            # Scripts, Vite dev dependency, Explore runtime dependencies
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

One file, ~2300 lines, organised into sections separated by `// ===== Name =====`
banner comments. In order:

| Section | Responsibility |
| --- | --- |
| Localization | Locale discovery, `t()`, `countryName()`, `capitalName()`, `countryCode()` |
| Theme management | Theme registry, apply/load/toggle variant |
| Font management | Font registry and application |
| Corner padding / radius | Numeric appearance settings |
| Questions per quiz / Answer options / Lives | Quiz-size and Infinite-lives settings |
| Streak management | Best streak persistence and record detection |
| Quiz mode management | Mode registry and active mode |
| Language management | Active language + browser detection |
| Lite mode management | `liteMode` state, `applyLiteMode()` / `loadLiteMode()`, `data-lite` attribute |
| Timer management | Timed-mode enable/seconds |
| Command line position management | Where `:` appears |
| Shuffle utility | Fisher–Yates `shuffleWith(arr, rng)` and `shuffle()` |
| Seeded random (daily challenge) | `hashSeed()` (FNV-1a) and `seededRandom()` (mulberry32) |
| Build quiz questions | `buildQuestion()`, `buildQuiz()` |
| Quiz timing | `elapsedSeconds()`, `formatDuration()` |
| Daily challenge | `buildDailyQuiz()`, `flag-quiz-daily-*` persistence, the welcome card, `renderDailyResult()` |
| Daily share image | Canvas share card: `buildDailyShareCanvas()`, `exportDailyImage()` |
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
| Welcome screen | ASCII map + Daily Challenge card + Play |
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
then base/reset styles, layout, and component styles, and ends with the
`[data-lite="true"]` overrides that disable motion and expensive paint in
[lite mode](../User/Lite-Mode.md). See [Theming](Theming.md).

The loading-screen styles are the one exception: they live inline in
`index.html` so the screen can paint before this stylesheet loads. See
[Architecture](Architecture.md).

Related: [Architecture](Architecture.md) · [Data Model](Data-Model.md)

## Explore

Explore adds root modules `explore.js` (session, networking, Leaflet),
`explore-math.js` (distance/scoring/validation), `explore-panorama.js` (lazy
WebGL renderer), `explore-spawns.json` (verified IDs and coordinates), and
`explore.css` (lazy styles). `main.js` adds the Explore section before Start quiz.
See [Explore](../User/Explore.md).

`explore-math.test.js` runs with `node --test explore-math.test.js` and checks
distance edge cases, scoring, and panorama validation without dependencies.
