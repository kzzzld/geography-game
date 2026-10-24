# kzzzl's geography game — Wiki

This wiki is the long-form documentation for **kzzzl's geography game**. It is a
set of plain Markdown files wired together with relative links — think of it as
an [Obsidian](https://obsidian.md/) vault that renders anywhere (GitHub, a text
editor, `less`). No special tooling is required.

If you just want the short version, read the top-level
[README](../README.md).

## Where do I start?

| I want to… | Go to |
| --- | --- |
| Play the game | [User wiki](User/README.md) |
| Hack on the code | [Developer wiki](Developer/README.md) |
| Host / deploy it | [Hoster wiki](Hoster/README.md) |

## The three wikis

### 🎮 [User wiki](User/README.md)

For players. Covers the game modes, how a quiz runs, scoring and streaks, every
setting, themes and fonts, keyboard shortcuts, and the built-in Vim-style
command line.

- [Getting Started](User/Getting-Started.md)
- [Game Modes](User/Game-Modes.md)
- [Daily Challenge](User/Daily-Challenge.md)
- [Playing a Quiz](User/Playing-a-Quiz.md)
- [Scoring and Streaks](User/Scoring-and-Streaks.md)
- [Settings](User/Settings.md)
- [Lite Mode](User/Lite-Mode.md)
- [Themes and Fonts](User/Themes-and-Fonts.md)
- [Keyboard Shortcuts](User/Keyboard-Shortcuts.md)
- [Command Line](User/Command-Line.md)

### 🛠️ [Developer wiki](Developer/README.md)

For contributors. Covers the architecture, the data model, the quiz flow, the
world-map mode, localization, theming, persistence keys, and how to contribute.

- [Architecture](Developer/Architecture.md)
- [Project Structure](Developer/Project-Structure.md)
- [Data Model](Developer/Data-Model.md)
- [Quiz Flow](Developer/Quiz-Flow.md)
- [Map Mode](Developer/Map-Mode.md)
- [Localization](Developer/Localization.md)
- [Theming](Developer/Theming.md)
- [Storage Keys](Developer/Storage-Keys.md)
- [Command Line Internals](Developer/Command-Line-Internals.md)
- [Contributing](Developer/Contributing.md)

### 📦 [Hoster wiki](Hoster/README.md)

For people putting it on a server. Covers building, static hosting, NixOS, and
Docker.

- [Building](Hoster/Building.md)
- [Static Hosting](Hoster/Static-Hosting.md)
- [NixOS](Hoster/NixOS.md)
- [Docker](Hoster/Docker.md)
- [Troubleshooting](Hoster/Troubleshooting.md)

## How this wiki is linked

- Every folder has a `README.md` that acts as its index.
- Notes link to each other with **relative Markdown links** (e.g.
  `[Game Modes](User/Game-Modes.md)`), so they work on any Markdown renderer.
- You can open this `wiki/` folder directly as an Obsidian vault; the relative
  links resolve there too.

## At a glance

- **Tech:** vanilla JavaScript + Vite, no framework
- **Content:** 207 countries/territories, 7 game modes, 2 languages (EN, TR)
- **Look:** 6 themes with optional light variants, 7 fonts
- **Performance:** [Lite mode](User/Lite-Mode.md) (off by default) skips fonts, preloading, and effects
- **Hosting:** any static host, NixOS flake, Docker
