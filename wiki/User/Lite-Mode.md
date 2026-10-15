# Lite Mode

**Lite mode** is a performance switch for slow computers, weak GPUs, or poor
connections. It strips out the app's animations, visual effects, and eager
loading so the game starts faster and paints more cheaply. It is **off by
default**.

## Turning it on

You can toggle lite mode from three places:

- **Settings** — the **Lite mode** switch at the top of the General category.
- **The loading screen** — the **Lite mode** button next to **Skip**, so you can
  enable it before the app finishes booting.
- **The [command line](Command-Line.md)** — `:lite on`, `:lite off`, or `:lite`
  on its own to toggle.

The choice is remembered between visits (`localStorage`), just like your theme
and language.

## What it changes

| Area | Normal | Lite mode |
| --- | --- | --- |
| Web fonts | All seven fonts are downloaded up front | No fonts are downloaded; the browser's system monospace font is used |
| Startup preload | Fonts, the world map, and map zoom data load before the welcome screen | Nothing is preloaded; map assets load only when a Map question needs them |
| Animations | Button shine, logo shimmer, ASCII float, loader ring, streak pop/flicker/burst | All disabled |
| Transitions | Hover/entrance/modal transitions | All instant |
| Effects | Gradient text, backdrop blur, drop shadows, glows | Removed or made solid |
| Theme gallery | Cards are scaled, dimmed, and blurred for depth | Cards sit flat, with no blur |

Gameplay is unchanged — the same modes, scoring, streaks, and timed mode work
exactly as before. Timed mode's countdown still runs; only its decorative
effects are skipped.

## Things to know

- The setting is marked **Refresh Needed**: turning it on or off changes what
  gets fetched at startup (fonts, in particular), so a full reload gives the
  cleanest result. The visual changes apply immediately.
- If you enable lite mode *from the loading screen*, the page keeps any fonts it
  already started fetching for that session, but the current page stops
  animating right away and the next load skips them.
- Lite mode does not change the **theme** or **font choice** — those are still
  remembered, they just may not render until the fonts are available.

Related: [Settings](Settings.md) · [Getting Started](Getting-Started.md) ·
[Command Line](Command-Line.md)
