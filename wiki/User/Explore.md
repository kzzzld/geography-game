# Explore

Choose **Explore** in the mode selector (or `:mode explore`), then Play. Find
where you are from street photography, explore nearby positions, and place a
pin on a world map. Each run has five untimed rounds. Quiz length, lives, Daily
Challenge, Mixed, and correct-answer streaks do not affect Explore.

## Playing

The street view fills a taller viewing area. Controls use icons with translated
tooltips and accessible labels: arrows move between photos, the nearby marker
finds a neighbouring photo, the house returns to start, the picture switches to
flat viewing, and the exit arrow leaves Explore.

Drag the panorama to look around. Previous, Next photo, and Nearby follow
Panoramax links; each move must lead to another panorama within 100 metres of
your current position. Return to start takes you back to the original photo.
The original start remains the scoring target, however far you travel.

A live map thumbnail sits in the lower-right corner of the street view, starting
with a neutral world view. Click or tap its expand icon to enlarge it for
guessing; the shrink icon returns it to thumbnail size. In the expanded map,
click or tap to place the blue guess pin; click again to move it. The pin button
submits once the photo and map have loaded. The map expands for the result; red
marks the original start. The forward arrow advances
to the next round, then to the total and all five distances. Play again starts
a new run. Locations do not repeat within a run.

Each round awards `round(5000 × exp(-distanceKm / 2000))`; distances up to and
including 25 metres receive 5,000 points. The maximum total is 25,000. Distances
use the shortest great-circle route, including across the antimeridian.

## Coverage and external services

The bundled catalogue contains **42 distinct panoramic starts**, with one per
listed area. The original near-duplicate pairs have been reduced to one start
each, and every start is at least one kilometre from every other start.

| Region | Starting areas |
| --- | --- |
| France | Ajaccio, Bordeaux, Brest, Caen, Clermont-Ferrand, Dijon, Grenoble, Lille, Lyon, Marseille, Nantes, Nice, Paris, Rouen, Saint-Malo, Strasbourg, Toulouse |
| Northern and western Europe | Amsterdam, Brussels, Copenhagen, Dublin, Edinburgh, London, Oslo, Stockholm |
| Central and southern Europe | Berlin, Cologne, Geneva, Istanbul, Lisbon, Madrid, Prague, Vienna, Zurich |
| North America | New York, San Francisco |
| South America | Buenos Aires |
| Pacific | Sydney, Nouméa (New Caledonia) |
| Caribbean | Fort-de-France (Martinique), Pointe-à-Pitre (Guadeloupe) |
| Indian Ocean | Saint-Denis (Réunion) |

Metadata, SD image access, CORS, and a panoramic neighbour within 100 metres for
every entry were verified on 2026-10-29. Coverage is curated and still weighted
toward Europe, rather than worldwide or country-balanced. Live imagery may
subsequently disappear or become unavailable. Five starts are sampled randomly
for each run; locations can still repeat between separate runs.

Photos and metadata come anonymously from [Panoramax](https://panoramax.fr/).
Photographer, original source, and licence links remain below each photo; follow
those links for reuse terms. Location names, capture details, and coordinates
are hidden during play, but the browser receives them. This is a casual game,
without cheat prevention. The map uses [OpenStreetMap](https://www.openstreetmap.org/copyright)
raster tiles with visible attribution. These services receive normal browser
network requests; no account or application backend is required.

Only the current photo's SD image is downloaded. The visible map thumbnail
loads tiles after a starting photo succeeds. There are no speculative photo
or tile downloads. Tiles use ordinary browser caching. Public services offer
best-effort availability; heavy deployments should select a suitable tile
provider and comply with its policy.

## Lite mode and failures

[Lite mode](Lite-Mode.md) uses the same photos and movement controls, but shows
a cropped, horizontally scrollable image. It does not import the panorama or
Three.js code. Toggling lite mode preserves the round, current photo, and guess
while replacing the renderer. View as photo also offers this fallback when
WebGL is unavailable. No automatic motion or panorama transitions are used.

Metadata and SD image requests time out after 15 seconds and are aborted when
you exit or switch modes. A failed start tries at most three catalogue entries,
then offers Retry and Exit. Failed movement keeps the current photo. Failed
imagery or map loading never awards points or consumes a round. Expand or move
the map to retry tiles. A run whose catalogue is exhausted can be exited and
started again.

## Hosting

Explore remains part of the static Vite build. Its local dependencies are
Leaflet and Photo Sphere Viewer with Three.js, explicit exceptions to the
project's general runtime-dependency rule. Explore code and styles load only
when entering it; panorama code loads only when needed outside lite mode.

Set these optional Vite variables **at build time**:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_EXPLORE_API_URL` | `https://api.panoramax.xyz/api` | Panoramax STAC API base; must resolve the bundled catalogue IDs |
| `VITE_EXPLORE_TILE_URL` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Leaflet raster tile URL template |
| `VITE_EXPLORE_TILE_ATTRIBUTION` | OpenStreetMap contributors copyright link | Trusted HTML attribution required by your tile provider |

The API and image origins must permit browser CORS. Preserve the Referer header,
visible attribution, and browser cache headers required by the
[OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
Do not add prefetching, offline tile downloads, or cache-busting. If using CSP,
allow the configured API, returned photo origins, tile origin, and `blob:`
images. No proxy, tile server, or imagery backend is necessary. A custom API
with different imagery requires updating `explore-spawns.json` and verifying
its panoramic starts and movement links.

Related: [Game Modes](Game-Modes.md) · [Static hosting](../Hoster/Static-Hosting.md)
