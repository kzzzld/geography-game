# Data Model

All quiz content comes from `public/data.json`, a flat JSON array. There is no
database, no schema file, and no build step that transforms it.

## Country entry

```json
{
  "country": "Japan",
  "flag": "https://flagcdn.com/w320/jp.png",
  "type": "recognized",
  "capital": "Tokyo"
}
```

| Field | Type | Purpose |
| --- | --- | --- |
| `country` | string | Display name; the answer value for every mode. Also the unique key that wrong answers are filtered against. |
| `flag` | string | Flag image URL. The two-letter code in `flagcdn.com/w320/<code>.png` is what [Map mode](Map-Mode.md) uses to find the country on the map. |
| `type` | string | Classification: `recognized`, `disputed`, `autonomous`, or `unrecognized`. Informational only — not used to filter or score. |
| `capital` | string | Capital city; the prompt in Capital → Country mode. |

Currently `data.json` holds **207 entries** with **201 unique flag codes**, so a
few codes repeat (e.g. shared or duplicate flags). Every entry has a `capital`.

### `type` distribution

| Type | Count |
| --- | --- |
| recognized | 193 |
| unrecognized | 6 |
| disputed | 4 |
| autonomous | 4 |

`type` is displayed nowhere and is not used to filter quizzes; it exists purely
as metadata for future use and for readers of the data file.

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
  **Mixed** it's randomly chosen from `['flag', 'country', 'capital', 'map']`.

## Building a quiz

```js
function buildQuiz() {
  const shuffled = shuffle(countries)
  const selected = shuffled.slice(0, Math.min(questionsPerQuiz, shuffled.length))
  return selected.map(country => buildQuestion(country))
}
```

The country pool is shuffled, the first `questionsPerQuiz` are taken, then each
becomes a question with its own shuffled options.

## Retrying missed questions

`missedQuestions` holds the actual question objects you got wrong. Retrying maps
them back through `buildQuestion(q.country, q.mode)`, which keeps the same
prompt mode but generates **fresh** wrong options and reshuffles them.

## Adding or editing data

Edit `public/data.json` directly. Keep the fields exact — `country` is used as
the answer key and as the lookup into locale `countries`/`capitals` maps, so
renaming a country means updating every locale that translates it. See
[Localization](Localization.md) and the root README's "Adding or Editing
Countries".

Related: [Quiz Flow](Quiz-Flow.md) · [Map Mode](Map-Mode.md) ·
[Localization](Localization.md)
