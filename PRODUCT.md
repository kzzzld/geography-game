# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: trivia and quiz fans who enjoy general-knowledge games and want a
polished, replayable format they can return to. They are usually playing in a
short session — a break, a commute, or a few spare minutes — often on desktop
but with no assumption of a large screen.

Secondary audiences the product does not optimize for but must not exclude:
geography and flag enthusiasts drawn to the breadth of territories and the map
mode, and self-hosters/tinkerers who run the static build themselves.

## Product Purpose

A fast, minimal flag-guessing quiz: guess the country from its flag (and from
capitals and the map), track score and streak, and finish on a results screen
with the option to retry missed questions. Success means a quiz that starts
instantly, plays without friction, and is worth replaying.

## Positioning

One country pool of 207 recognized, disputed, autonomous, and unrecognized
territories drives six distinct game modes — Flag → Country, Country → Flag,
Capital → Country, Map → Country, Mixed, and Infinite (an endless, lives-based
run) — rather than a single flag-to-name game. Neighboring flag quizzes stop at
UN members and one mode; this one asks the same pool to be recognized by flag,
by capital, and on a world map.

## Operating Context

- Static web app; runs entirely in the browser with no backend.
- Quiz data is fetched at runtime from `public/data.json`; the world map
  (`public/world.svg`) and per-country focus rectangles (`public/focus.json`)
  drive Map mode.
- Themes and fonts are chosen in-app and persisted in `localStorage`.
- Two languages (English, Turkish) selectable at runtime; locale files are
  auto-discovered at build time.
- Distributed as source; can be hosted on any static host, Vercel, NixOS, or
  Docker.

## Capabilities and Constraints

- 6 modes, 5 multiple-choice options per question, configurable quiz length
  (5–50, default 20), live score, streak with all-time best, retry-missed.
- Infinite mode is endless and lives-based (1–10 lives, default 3); each wrong
  answer costs a life and ends the run at zero.
- 207 territories spanning recognized, disputed, autonomous, and unrecognized;
  the `type` field is informational and does not currently filter quizzes.
- 6 themes with optional light variants and 7 font choices.
- Lite mode (off by default) drops web fonts, eager preloading, and motion/effects
  for slow devices and connections; toggled from Settings, the loading screen, or
  `:lite`.
- Hard constraint: vanilla ES modules + CSS bundled by Vite. No frameworks and
  no new runtime dependencies.
- Terminology: "country"/"territory" is used loosely for all 207 pool entries.
- Map mode is identifier-driven: the two-letter ISO code parsed from the
  `flagcdn.com` flag URL. Territories whose flags are not hosted there have no
  code and are skipped as Map prompts but remain in other modes.

## Brand Commitments

- Name: "kzzzl's geography game" — personal, lowercase, non-corporate. No
  rebranding.
- Bilingual English + Turkish is first-class, including country and capital
  names.
- Open source under MIT; contributions are accepted by email only — pull
  requests are not accepted.

## Evidence on Hand

- Real, complete data: `public/data.json` (207 entries with names, flag URLs,
  classification, capitals), real map geometry in `public/world.svg` and
  `public/focus.json`, and full EN/TR locale files in `locales/`.
- No marketing claims, testimonials, user counts, benchmarks, or press exist;
  future work must not fabricate them.

## Product Principles

1. Instant, frictionless play — the loading experience and quiz flow must never
   make a player wait or hesitate.
2. Breadth with honesty — include the whole world, including disputed and
   unrecognized territories, and label data factually rather than editorially.
3. One pool, many questions — every mode draws from the same data so each
   territory is learnable in several ways.
4. Bilingual by default — English and Turkish are equal citizens, not an
   afterthought.
5. Minimal, dependency-light craft — the vanilla stack is a feature, and
   simplicity beats cleverness.
