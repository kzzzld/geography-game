# Localization

The UI and all country/capital names are translatable. Locale files are plain
JSON in `locales/` and are **bundled at build time** (not fetched), so a new
language becomes available automatically as long as the file exists when Vite
runs.

## How locales are discovered

```js
const LOCALE_MODULES = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })

const LANGUAGES = Object.entries(LOCALE_MODULES)
  .map(([path, data]) => ({
    id: path.replace('./locales/', '').replace(/\.json$/, ''),
    label: data.name || path,
    data,
  }))
  .sort((a, b) => (a.id === 'en' ? -1 : b.id === 'en' ? 1 : a.id.localeCompare(b.id)))
```

- The file id is the filename without extension (`en`, `tr`).
- The display label is the file's `name` field.
- The list is sorted with English first, then alphabetically.

Because the paths are known to Vite at compile time, you **cannot** construct a
locale path at runtime. Adding a language means adding a file and rebuilding.

## File shape

```json
{
  "name": "Deutsch",
  "ui": { "app.logo": "Flaggen-Quiz", "...": "..." },
  "countries": { "Japan": "Japan" },
  "capitals": { "Tokyo": "Tokio" }
}
```

| Key | Required | Purpose |
| --- | --- | --- |
| `name` | yes | Label shown in the language selector (its own language, e.g. `Türkçe`) |
| `ui` | yes | Interface strings, keyed by dotted names |
| `countries` | no | Map from English country name → translated name |
| `capitals` | no | Map from English capital name → translated name |

`en.json` omits `countries`/`capitals` entirely — English values are used as
their own translations. `tr.json` translates all 207 countries and the unique
capital names.

## The `t()` function

```js
function t(key, vars) {
  const value = locale?.ui?.[key] ?? FALLBACK_LOCALE?.ui?.[key] ?? key
  if (!vars) return value
  return Object.entries(vars).reduce((str, [k, v]) => str.replaceAll(`{${k}}`, v), value)
}
```

- Looks up the active locale's `ui` map.
- Falls back to English (`FALLBACK_LOCALE`).
- Falls back to the key itself (so a missing string is visible, not blank).
- Interpolates `{placeholder}` tokens from the `vars` object, replacing **all**
  occurrences.

Example string: `"quiz.questionOf": "Question {current} / {total}"`, called as
`t('quiz.questionOf', { current, total })`.

## Country and capital names

```js
function countryName(name) {
  return locale?.countries?.[name] ?? name
}
function capitalName(name) {
  return locale?.capitals?.[name] ?? name
}
```

The keys are the **English** values exactly as they appear in `data.json`, so
renaming a country in the data file breaks its translation until the locale is
updated to match.

## Adding a language

1. Copy `locales/en.json` to `locales/<code>.json`.
2. Set `name` to the language's endonym.
3. Translate the `ui` values.
4. Optionally add `countries` and `capitals` maps (skipping keys leaves them in
   English).
5. Rebuild/restart — the language appears in the Settings dropdown and can be
   selected with `:lang <code>`.

Any UI key you omit falls back to English, so a partially translated locale is
fine to ship.

## Language selection and detection

- `loadLanguage()` uses the stored `flag-quiz-language` if valid.
- Otherwise `detectLanguage()` walks `navigator.languages`, matches the base
  tag against locale ids, and falls back to English.
- `applyLanguage()` stores the choice, swaps `locale`, updates the command
  line's aria-label, and (when changed from Settings) triggers `rerender()`.

Related: [Project Structure](Project-Structure.md) · [Data Model](Data-Model.md)
