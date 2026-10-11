# Map Mode

Map Mode is the most involved part of the app. It shows a world map zoomed in on
one country with that country highlighted, and asks you to identify it.

## Assets

| File | Role |
| --- | --- |
| `public/world.svg` | The world, one `<path>` per country, each `id` set to its ISO alpha-2 code (250 paths) |
| `public/focus.json` | Map of ISO alpha-2 code → `[x, y, width, height]` focus rectangle (250 entries) |

`world.svg` is sourced from
[@svg-maps/world](https://github.com/VictorCazanave/svg-maps), where each
country path is keyed by its ISO alpha-2 code.

## Finding the country

The target is located by the two-letter code embedded in its flag URL:

```js
function countryCode(country) {
  return /flagcdn\.com\/w320\/([a-z]{2})\.png/.exec(country?.flag || '')?.[1] || null
}
```

In `renderQuestion()` the map prompt is rendered empty with the code on a data
attribute:

```html
<div class="world-map" role="img" aria-label="Map" data-code="jp"></div>
```

## Hydration

Maps are loaded once and cached in module-level promises:

```js
function loadWorldMap() {
  if (!worldMapPromise) {
    worldMapPromise = fetch(WORLD_MAP_URL)
      .then(res => res.text())
      .then(text => new DOMParser().parseFromString(text, 'image/svg+xml').documentElement)
      .catch(() => null)
  }
  return worldMapPromise
}
```

`loadWorldFocus()` does the same for `focus.json`. Both failures resolve to
`null` rather than rejecting.

`hydrateWorldMap()` then:

1. Clones the parsed SVG template.
2. Adds the `.world-svg` class, sets `preserveAspectRatio`, marks it
   `aria-hidden`, and gives every path the `.world-country` class.
3. Finds the path whose `id` matches the country code and adds `.world-target`.
4. Replaces the placeholder's children with the SVG.
5. Sets a `viewBox` (see below).
6. Adds the `.loaded` class to fade the map in.

## Zooming

The zoom centres on the focus rectangle when one exists, otherwise on the
country's own bounding box (`getBBox()`).

```js
const WORLD_VIEWBOX = { width: 1010, height: 666 }
const WORLD_MIN_EXTENT = { width: 3, height: 2 }

function zoomViewBox(bbox) {
  const ratio = WORLD_VIEWBOX.width / WORLD_VIEWBOX.height
  let width = Math.max(bbox.width * 2.2, WORLD_MIN_EXTENT.width)
  let height = Math.max(bbox.height * 2.2, WORLD_MIN_EXTENT.height)
  if (width / height > ratio) height = width / ratio
  else width = height * ratio
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  return `${cx - width / 2} ${cy - height / 2} ${width} ${height}`
}
```

- The view is **2.2×** the target's extent, with a **minimum** extent of
  `3 × 2` so point-sized targets still get a valid viewBox.
- The result is expanded to the map's `1010:666` aspect ratio so nothing is
  stretched.
- Centres the box on the target.

## Countries without a map code

`world.svg` only contains the ~250 ISO-keyed countries and territories. A
handful of entries in `data.json` — the unrecognized/autonomous territories
whose flags come from Wikimedia instead of `flagcdn.com` (Abkhazia, South
Ossetia, Transnistria, Northern Cyprus, Somaliland, Artsakh, Catalonia) — have
no two-letter code and no path to highlight, so Map mode cannot draw them.

Those entries are filtered out of map questions at build time:

- **Map → Country** builds its pool from `countries.filter(c => countryCode(c))`.
- **Mixed** falls back to a flag prompt if it would otherwise resolve `map` for
  such a country.

They still appear normally in Flag, Country, and Capital modes.

## Why `focus.json` exists

Some countries' bounding boxes are enormous because they include far-flung
territories — Alaska and Hawaii for the USA, the Azores for Portugal, overseas
departments for France. Zooming to the raw bounding box would show almost nothing
but ocean and the target would be a speck.

`focus.json` stores a hand/geometry-derived rectangle (`[x, y, width, height]`)
for each code that crops to the "core" of the country. When present it takes
precedence over the auto-computed bbox. It currently has **250 entries**, so most
countries have one; countries without a focus box fall back to `getBBox()`.

## Preloading

`preloadQuestionImages()` calls `loadWorldMap()` and `loadWorldFocus()` as soon
as a quiz containing any map question starts, so the assets are usually ready by
the time you reach one. The loading screen also warms both at startup (unless
skipped), so they are often already cached.

## Degradation

- No network / missing `world.svg` → `template` is `null`; the placeholder gets
  `.loaded` and the quiz continues with an empty prompt.
- No `focus.json` → focus falls back to the country bbox.
- No matching path id → no highlight and no zoom, but no crash.

Related: [Data Model](Data-Model.md) · [Quiz Flow](Quiz-Flow.md)
