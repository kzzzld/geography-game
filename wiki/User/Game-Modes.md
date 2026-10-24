# Game Modes

The game has **seven** modes, switchable at any time from the top bar. Each
question in **Mixed** picks one of the first five at random, so you never know
what you'll be asked next.

> The [Daily Challenge](Daily-Challenge.md) is separate from these modes: it's a
> fixed once-a-day quiz, not a mode you can switch to. It always runs as Flag →
> Country regardless of the mode selected here.

## Flag → Country

**Mode id:** `flag`

The prompt is a country's flag. Pick the country it belongs to from the answer
options.

- The flag is loaded from [`flagcdn.com`](https://flagcdn.com) as a `.png`.
- Answer options are country names.

## Country → Flag

**Mode id:** `country`

The prompt is a country's name. Pick its flag from the options.

- Answer options are rendered as flag images rather than text.
- This is the only mode where the answers are pictures.

## Capital → Country

**Mode id:** `capital`

The prompt is a capital city, shown under the label **"Capital of"** (or its
translated equivalent). Pick the country whose capital it is.

- Capital names are translated when a locale provides a `capitals` map.
- If a language doesn't translate a given capital, the English name is used.

## Name in Law → Country

**Mode id:** `law`

The prompt is a country's **official long-form name written in its own
language**, shown under the label **"Name in law"** (or its translated
equivalent). Pick the country it belongs to.

- Examples: *日本国* (Japan), *Schweizerische Eidgenossenschaft* (Switzerland),
  *Republik Indonesia* (Indonesia), *المملكة المغربية* (Morocco).
- The names live in the `native` field of [`public/data.json`](../Developer/Data-Model.md),
  one per entry, and are never translated — the answers stay in the selected
  language, only the prompt is in the country's own.
- The name shown is the one the country's own law uses, in its primary official
  language. Where a country has more than one official language, the
  most widely used one is picked (Dutch for Belgium, German for Switzerland,
  Sinhala for Sri Lanka); territories whose legal language is a former colonial
  one are shown in that language.
- Prompts may be in non-Latin scripts and right-to-left languages; the prompt
  element sets `dir="auto"` so Arabic, Hebrew, and Persian names render in the
  right direction.
- Country names are long and multilingual, so glyphs outside Latin may render
  with the system fallback font rather than the selected app font.

## Map → Country

**Mode id:** `map`

The prompt is an interactive world map, zoomed in on one country and
highlighting it. Pick the country shown.

- The country is located by the two-letter code in its flag URL
  (`flagcdn.com/w320/<code>.png`).
- The map is `public/world.svg`, with each country path keyed by its ISO
  alpha-2 code.
- Entries with no such code (the territories whose flags aren't hosted on
  `flagcdn.com`) aren't on the map, so they're skipped as Map prompts. They
  can still be answers, and still show up in the other modes.
- A per-country focus rectangle from `public/focus.json` keeps far-flung
  territories (Alaska, the Azores, …) out of the zoom, so remote islands don't
  wreck the framing.
- The map zooms tightly on the target — small states and islands are shown
  large and highlighted rather than lost in a continental view.
- The map fades in once it has loaded; a map question is the only one that
  needs to fetch extra data.

See [Map Mode](../Developer/Map-Mode.md) in the Developer wiki for internals.

## Mixed

**Mode id:** `mixed`

Each question independently resolves to one of **Flag**, **Country**,
**Capital**, **Name in Law**, or **Map**. A single quiz can therefore contain
all five prompt types.

Because Country → Flag is one of the five, some Mixed questions present the
answers as flag images instead of text.

## Infinite

**Mode id:** `infinite`

An endless **Flag → Country** quiz — the same questions can come round again.
You keep answering until you run out of **lives**; every wrong answer (or
timeout) costs one life, and the run ends at zero.

- The number of lives is configurable (1–10, default 3) — see
  [Settings](Settings.md#gameplay).
- Lives are shown as a heart counter in the score bar, next to the streak flame.
- The score bar shows just `Question N` (there's no total) and your score.
- Countries are drawn at random with replacement, so the same flag can reappear.
- The results screen is headed **Run Over!** and reports your score, accuracy,
  and best streak for the run.

## Switching modes

- Click a mode button in the top bar.
- Or use the command line: `:mode flag`, `:mode map`, `:mode mixed`,
  `:mode infinite`, etc. The alias `:gamemode` works too.
- Switching mode while a quiz is in progress restarts the quiz immediately.
- On the welcome and results screens, the choice just becomes the mode for the
  next quiz.

Related: [Playing a Quiz](Playing-a-Quiz.md) · [Command Line](Command-Line.md)
