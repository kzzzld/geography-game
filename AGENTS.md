# AGENTS.md

Instructions for AI agents (and humans) working in this repository.

This project is a vanilla-JS + Vite flag quiz with a long-form
[wiki](wiki/README.md). The single most important rule is below: **the wiki is
part of the change, not an afterthought.**

## 1. Keep the wiki in sync

Whenever you add, remove, or change how a feature works, update the wiki in the
same change. A code change that affects behaviour is not done until the docs
match. The wiki is the long-form documentation; the root [README](README.md) is
the short version.

Use this map to find the right page(s):

| You changed… | Update |
| --- | --- |
| A game mode (add/remove/rename) | [User/Game-Modes.md](wiki/User/Game-Modes.md), [Developer/Quiz-Flow.md](wiki/Developer/Quiz-Flow.md), README feature list |
| Scoring, points, streak logic | [User/Scoring-and-Streaks.md](wiki/User/Scoring-and-Streaks.md), [Developer/Quiz-Flow.md](wiki/Developer/Quiz-Flow.md) |
| Timer behaviour | [User/Playing-a-Quiz.md](wiki/User/Playing-a-Quiz.md), [Developer/Storage-Keys.md](wiki/Developer/Storage-Keys.md), [Developer/Quiz-Flow.md](wiki/Developer/Quiz-Flow.md) |
| A setting or its range/default | [User/Settings.md](wiki/User/Settings.md), [Developer/Storage-Keys.md](wiki/Developer/Storage-Keys.md) |
| Theme or font | [User/Themes-and-Fonts.md](wiki/User/Themes-and-Fonts.md), [Developer/Theming.md](wiki/Developer/Theming.md) |
| Keyboard shortcut | [User/Keyboard-Shortcuts.md](wiki/User/Keyboard-Shortcuts.md) |
| A command-line command/alias | [User/Command-Line.md](wiki/User/Command-Line.md), [Developer/Command-Line-Internals.md](wiki/Developer/Command-Line-Internals.md) |
| `data.json` shape or country pool | [Developer/Data-Model.md](wiki/Developer/Data-Model.md), README "Adding or Editing Countries" |
| Map mode / map assets | [Developer/Map-Mode.md](wiki/Developer/Map-Mode.md), README map note |
| Locale handling / a new language | [Developer/Localization.md](wiki/Developer/Localization.md), [User/Settings.md](wiki/User/Settings.md) |
| Build, hosting, Nix, Docker | [Hoster/](wiki/Hoster/README.md) pages and the matching README section |
| `localStorage` key | [Developer/Storage-Keys.md](wiki/Developer/Storage-Keys.md) |
| Module layout / new section in `main.js` | [Developer/Architecture.md](wiki/Developer/Architecture.md), [Developer/Project-Structure.md](wiki/Developer/Project-Structure.md) |

Rules:

- **New feature → new wiki page if it deserves one.** Add the page, then link it
  from the right index (`wiki/README.md`, `wiki/User/README.md`,
  `wiki/Developer/README.md`, or `wiki/Hoster/README.md`). Every page must be
  reachable from `wiki/README.md`.
- **Removing a feature → remove its docs too.** Don't leave stale pages or
  orphaned links. Delete the page and its index entries.
- **Changed behaviour → find every mention.** Grep the wiki and README for the
  feature name, not just the obvious page.
- Use **relative Markdown links** so the wiki renders anywhere (see
  [wiki/README.md](wiki/README.md)).
- After editing, verify links resolve and code fences are balanced.
- Update the root README only for the short version (features, commands, project
  structure) and link to the wiki for depth.

## 2. Other "when you do X, also do Y" rules

| When you… | Also… |
| --- | --- |
| Add a user-visible string | Add it to `locales/en.json` (and `tr.json` if you can) and read it through `t(...)`. Never hard-code UI text. |
| Add a locale file | Confirm it appears in the Settings dropdown; update [Developer/Localization.md](wiki/Developer/Localization.md) if the format changed. |
| Add a `localStorage` key | Add it to `resetApp()` and to [Developer/Storage-Keys.md](wiki/Developer/Storage-Keys.md), including its default and range. |
| Add a command-line command | Register it in `COMMAND_NAMES` (for completion) and document it in [User/Command-Line.md](wiki/User/Command-Line.md). |
| Add a persisted setting | Follow the `apply*` / `load*` pattern and list it in [Developer/Storage-Keys.md](wiki/Developer/Storage-Keys.md). |
| Change `public/` runtime assets | Keep them in `public/` (they're fetched by relative URL) and update the README project-structure note. |
| Change `package-lock.json` | Update `npmDepsHash` in `flake.nix` (the Nix build fails otherwise). |
| Change user-facing behaviour | Note it in the README feature list if it's headline-worthy. |
| Add a new top-level file/dir | Add it to the README project-structure block and [Developer/Project-Structure.md](wiki/Developer/Project-Structure.md). |

## 3. Code conventions

- **Keep code small, understandable, and easy to maintain. No bloat.** Write the
  simplest thing that works, prefer clarity over cleverness, and avoid
  unnecessary abstractions, helpers, or dependencies. If a change makes a file
  or function noticeably bigger, stop and ask whether it can be simpler.
- **No frameworks, no new runtime dependencies.** Plain ES modules + CSS bundled
  by Vite.
- **No comments** unless they clarify something non-obvious. Section banners
  (`// ===== Name =====`) are the exception.
- Put settings through the `apply*` / `load*` pair; prefix storage keys with
  `flag-quiz-`.
- Follow the surrounding patterns before inventing new ones. Read
  [Developer/Architecture.md](wiki/Developer/Architecture.md) before large work.
- Match the existing commit style (Conventional Commits: `feat:`, `fix:`,
  `docs:`, `chore:`, `refactor:`).

## 4. Commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
nix build        # Nix package → result/ (if you use Nix)
```

There is no test suite and no configured linter/typecheck. Verify changes by
building and running the app.

## 5. Git

- **Commit after every change.** Every logical unit of work gets its own commit
  as soon as it's done — do not leave changes sitting uncommitted.
- Keep commits focused; write imperative, conventional commit subjects
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Include the doc/wiki updates in the same commit as the code they describe.
- Patches are accepted **by email only** — see
  [Developer/Contributing.md](wiki/Developer/Contributing.md). Pull requests are
  not accepted.
