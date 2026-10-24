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
  "official": { "Japan": "Staat Japan" },
  "capitals": { "Tokyo": "Tokio" }
}
```

| Key | Required | Purpose |
| --- | --- | --- |
| `name` | yes | Label shown in the language selector (its own language, e.g. `Türkçe`) |
| `ui` | yes | Interface strings, keyed by dotted names |
| `countries` | no | Map from English country name → translated name |
| `official` | no | Map from English country name → official long-form name |
| `capitals` | no | Map from English capital name → translated name |

`en.json` omits `countries`/`capitals` entirely — English values are used as
their own translations. It still ships an `official` map with the long-form names
(e.g. `"North Korea": "Democratic People’s Republic of Korea"`). `tr.json`
translates all 207 countries and the unique capital names, and provides its own
Turkish `official` names.

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
  if (countryFullNames && name) {
    const official = locale?.official?.[name] ?? FALLBACK_LOCALE?.official?.[name]
    if (official) return official
  }
  return locale?.countries?.[name] ?? name
}
function capitalName(name) {
  return locale?.capitals?.[name] ?? name
}
```

The keys are the **English** values exactly as they appear in `data.json`, so
renaming a country in the data file breaks its translation until the locale is
updated to match.

When the **Full country names** setting is on (`flag-quiz-full-names`),
`countryName()` prefers the `official` map, falling back to English's `official`
map and finally to the short name — so a locale without an `official` entry still
shows the English long form. The official names are data, not UI strings, so they
live in the locale files alongside the other name maps.

The `native` name used by **Name in Law → Country** is the one name that is
*not* localizable: it's the country's own-language legal name, identical in
every UI language, so it lives in `data.json` and no locale map is involved.

## Adding a language

1. Copy `locales/en.json` to `locales/<code>.json`.
2. Set `name` to the language's endonym.
3. Translate the `ui` values.
4. Optionally add `countries`, `official`, and `capitals` maps (skipping keys
   leaves them in English, or the English `official` name for full names).
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
