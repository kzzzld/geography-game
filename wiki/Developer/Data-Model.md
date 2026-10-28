# Data Model

All quiz content comes from `public/data.json`, a flat JSON array. There is no
database, no schema file, and no build step that transforms it.

## Country entry

```json
{
  "country": "Japan",
  "flag": "https://flagcdn.com/w320/jp.png",
  "type": "recognized",
  "capital": "Tokyo",
  "native": "日本国"
}
```

| Field | Type | Purpose |
| --- | --- | --- |
| `country` | string | Display name; the answer value for every mode. Also the unique key that wrong answers are filtered against. |
| `flag` | string | Flag image URL. The two-letter code in `flagcdn.com/w320/<code>.png` is what [Map mode](Map-Mode.md) uses to find the country on the map. |
| `type` | string | Classification: `recognized`, `disputed`, `autonomous`, or `unrecognized`. Informational only — not used to filter or score. |
| `capital` | string | Capital city; the prompt in Capital → Country mode. |
| `native` | string | The country's official long-form name in its own language; the prompt in Name in Law → Country mode. Not localized — the same string is used for every UI language. |

`native` values come from Wikidata's *official name* statements (P1448) and the
native-name field of each country's Wikipedia infobox; where a country names
itself in several official languages, the entry holds the name in its primary
one. Arabic-script names are stored without vowel diacritics.

Currently `data.json` holds **207 entries** with **201 unique flag codes**, so a
few codes repeat (e.g. shared or duplicate flags). Every entry has a `capital`
and a `native` name, so no entry is skipped in Capital → Country or Name in Law
→ Country mode.

### `type` distribution

| Type | Count |
| --- | --- |
| recognized | 193 |
| unrecognized | 6 |
| disputed | 4 |
| autonomous | 4 |

`type` is displayed nowhere and is not used to filter quizzes; it exists purely
as metadata for future use and for readers of the data file.

Seven entries (unrecognized/autonomous territories such as Abkhazia and South
Ossetia) have Wikimedia flag URLs instead of `flagcdn.com` ones, so they have no
two-letter map code and are skipped in Map mode. See
[Map Mode](Map-Mode.md#countries-without-a-map-code).

## Question (runtime only)

Questions are **not** stored in `data.json` — they're built in memory by
`buildQuestion()`:

```js
{
  country,        // the full country entry (this is the correct answer)
  options,        // array of country entries, shuffled (includes the correct one)
  mode,           // the resolved prompt mode for this question
}
```

- `options` has `optionsCount` items (default 5), picked from all countries whose
  `country` differs from the target, then shuffled together with the target.
- Answered options are compared by their `country` string:

  ```js
  const isCorrect = selectedCountry === q.country.country
  ```

- `mode` is resolved at build time. For a normal mode it's just that mode; for
  **Mixed** it's randomly chosen from
  `['flag', 'country', 'capital', 'law', 'map']`. If that choice is `map` but
  the country has no map code — or `law` but the entry has no `native` name — it
  falls back to `flag`.

## Building a quiz

```js
function buildQuiz() {
  const pool = quizMode === 'map' ? countries.filter(c => countryCode(c)) : countries
  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, Math.min(questionsPerQuiz, shuffled.length))
  return selected.map(country => buildQuestion(country))
}
```

For **Map → Country** the pool first drops countries that aren't on
`world.svg` (see [Map Mode](Map-Mode.md)); the other modes use the full pool.
The pool is then shuffled, the first `questionsPerQuiz` are taken, and each
becomes a question with its own shuffled options.

## Retrying missed questions

`missedQuestions` holds the actual question objects you got wrong. Retrying maps
them back through `buildQuestion(q.country, q.mode)`, which keeps the same
prompt mode but generates **fresh** wrong options and reshuffles them.

## Adding or editing data

Edit `public/data.json` directly. Keep the fields exact — `country` is used as
the answer key and as the lookup into locale `countries`/`capitals` maps, so
renaming a country means updating every locale that translates it. `native` is
the exception: it's the country's own-language name, so it lives here and never
in a locale file. See [Localization](Localization.md) and the root README's
"Adding or Editing Countries".

Related: [Quiz Flow](Quiz-Flow.md) · [Map Mode](Map-Mode.md) ·
[Localization](Localization.md)

## Explore spawn catalogue

Explore uses `explore-spawns.json`, bundled into its lazy module, independently
of the 207-country quiz pool. Each entry has `id` (Panoramax photo UUID),
`sequence` (collection UUID), `coordinates` (`[longitude, latitude]`), and `area`
(a maintainer-facing coverage label, hidden during play). The current pool has
42 starts; see [Explore coverage](../User/Explore.md#coverage-and-external-services).

Keep IDs unique and starts at least one kilometre apart so nearby frames do not
fill the pool with near-duplicates. Before accepting an entry, fetch its
metadata through the configured API and confirm a 360-degree field of view, a
loadable SD image, browser CORS, and at least one panoramic previous/next/related
photo within 100 metres using the actual neighbour metadata coordinates.
Panoramax search supports `filter=field_of_view%3D360` alongside `bbox` to find
panoramic candidates. Resolve relative links against their metadata URL.

Run `node --test explore-math.test.js` to check catalogue IDs, coordinate ranges,
and geographic separation alongside distance and scoring. These offline checks
do not replace live image, CORS, and neighbour verification. Update the coverage
guide when changing the catalogue.
