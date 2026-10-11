# kzzzl's geography game

A fast, minimal flag-guessing quiz built with vanilla JavaScript and Vite. Guess the country from its flag, track your score, and customize the look with multiple themes and fonts.

## Features

- 🌍 20-question quizzes (configurable from 5–50) randomly drawn from a pool of 207 countries and territories (recognized, disputed, autonomous, and unrecognized)
- 🎯 5 multiple-choice options per question, shuffled each round
- 🔀 Five game modes switchable from the top bar: Flag → Country, Country → Flag, Capital → Country, Map → Country, and Mixed
- 🌐 English and Turkish translations, including country and capital names
- 🏆 Live score tracking with a results screen at the end
- 🔥 Streak counter for consecutive correct answers, with an all-time best saved between sessions
- 🔁 Retry missed questions from the results screen with freshly shuffled options
- 🎨 6 themes (Tokyo Night, Nord, Dark, AMOLED, Catppuccin, Black Metal) with a dark/light variant toggle for themes that provide both
- 🔤 7 font choices (Inter, JetBrains Mono, Iosevka, Fira Code, IBM Plex Mono, Source Code Pro, Roboto Mono)
- 💾 Theme and font preferences persisted in `localStorage`
- ⏳ A loading screen that preloads the country data, map geometry, and fonts before the welcome screen — with a skip button for slow connections
- ⚡ No frameworks — plain JS, HTML, and CSS, bundled with Vite

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Installation

```bash
npm install
```

### Development

Start the local dev server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

Create a production build:

```bash
npm run build
```

Output is written to the `dist/` folder.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── AGENTS.md         # Instructions for AI agents working on the project
├── index.html        # App entry HTML (incl. the loading-screen markup + critical CSS)
├── main.js           # App logic (quiz flow, rendering, settings)
├── style.css         # Theming and layout styles
├── locales/
│   ├── en.json       # English strings + country/capital names
│   └── tr.json       # Turkish strings + country/capital names
├── public/
│   ├── data.json     # Quiz data (country names + flag image URLs)
│   ├── world.svg     # World map for Map mode
│   └── focus.json    # Per-country zoom rectangles for Map mode
├── flake.nix         # Nix flake: dev shell, package, NixOS module
├── Dockerfile        # Build + serve with nginx {UNTESTED}
├── compose.yml       # Docker Compose service {UNTESTED}
├── LICENSE           # MIT
└── package.json
```

> **Note:** Quiz data lives in `public/data.json` so it's copied as-is into the build output and available at runtime via `fetch('./data.json')`. Keep any static assets fetched at runtime inside `public/`.

## Translations

Locale files live in `locales/` and are auto-discovered at build time, so adding a
new language is just a matter of dropping in a new JSON file (e.g. `locales/de.json`).
Each file has three parts:

```json
{
  "name": "Deutsch",
  "ui": { "app.logo": "Flaggen-Quiz", "...": "..." },
  "countries": { "Japan": "Japan" },
  "capitals": { "Tokyo": "Tokio" }
}
```

- `name` — label shown in the language selector
- `ui` — interface strings; `{placeholder}` values are interpolated (e.g. `"quiz.questionOf": "Frage {current} / {total}"`)
- `countries` / `capitals` — optional maps keyed by the English values in `data.json`; missing entries fall back to English

If a new locale omits the `countries`/`capitals` maps, country and capital names
simply stay in English.

## Adding or Editing Countries

Edit `public/data.json`. Each entry follows this shape:

```json
{ "country": "Japan", "flag": "https://flagcdn.com/w320/jp.png", "type": "recognized", "capital": "Tokyo" }
```

- `country` — display name shown as an answer option
- `flag` — URL to the flag image
- `type` — classification (`recognized`, `disputed`, `autonomous`, `unrecognized`) — informational, not currently used to filter quizzes
- `capital` — capital city name, used as the prompt in Capital → Country mode

> **Map mode:** The country is identified by the two-letter code in its flag URL
> (`flagcdn.com/w320/<code>.png`) and located on a world map
> (`public/world.svg`, sourced from
> [@svg-maps/world](https://github.com/VictorCazanave/svg-maps), where each
> country path is keyed by its ISO alpha-2 code). The map zooms tightly to the
> country and highlights it. `public/focus.json` holds a per-country focus
> rectangle (`[x, y, width, height]`) that excludes far-flung territories (e.g.
> Alaska for the US, Azores for Portugal) so remote islands don't defeat the
> zoom; it is generated from the map geometry. Entries whose flags aren't hosted
> on `flagcdn.com` (Abkhazia, South Ossetia, Transnistria, Northern Cyprus,
> Somaliland, Artsakh, Catalonia) have no code and aren't drawn on the map, so
> they're skipped as Map prompts but still appear in the other modes.

## Deployment

This is a static Vite app and deploys cleanly to [Vercel](https://vercel.com):

```bash
npm run build
```

Vercel will detect the Vite framework preset automatically and serve the `dist/` output.

## Docker {UNTESTED}

> **{UNTESTED}** — these files are provided as a starting point and have not been verified.

The included `Dockerfile` builds the site and serves it with nginx. `compose.yml`
wires it up on port `8080`.

Run with Docker Compose:

```bash
docker compose up --build
```

The app will be available at `http://localhost:8080`.

Or build and run the image directly:

```bash
docker build -t kzzzl-geography-game .
docker run --rm -p 8080:80 kzzzl-geography-game
```

## Nix

The project ships a `flake.nix` providing a dev shell, a package, and a NixOS module.

### Dev shell

```bash
nix develop
```

### Build

```bash
nix build
```

The static site is written to `result/`.

### NixOS hosting

Add the flake as an input and enable the module. It serves the built site with
nginx bound to `127.0.0.1` (meant to sit behind a reverse proxy):

```nix
{
  inputs.geography-game.url = "github:kzzzl/geography-game";

  outputs = { nixpkgs, geography-game, ... }: {
    nixosConfigurations.myvps = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        geography-game.nixosModules.default
      ];
    };
  };
}
```

```nix
{
  services.kzzzl-geography-game.enable = true;
  services.kzzzl-geography-game.port = 8080; # default
}
```

Module options:

- `enable` — turn the service on
- `port` — port to listen on (default `8080`)
- `package` — package to serve (defaults to the flake's package)

Example reverse proxy for a public domain:

```nix
{
  services.nginx = {
    enable = true;
    virtualHosts."geog.example.com" = {
      forceSSL = true;
      enableACME = true;
      locations."/".proxyPass = "http://127.0.0.1:8080";
    };
  };

  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
```

## Contributing

Patches are welcome by email only, to **kzzzl@kzzzl.xyz**. Pull requests are not
accepted. See the [Contributing guide](wiki/Developer/Contributing.md) for code
style and how to send a patch with `git send-email` or `git format-patch`.

## Documentation

Long-form documentation lives in the [wiki](wiki/README.md), split into three
audiences:

- **[User wiki](wiki/User/README.md)** — game modes, scoring, settings, themes,
  keyboard shortcuts, and the command line.
- **[Developer wiki](wiki/Developer/README.md)** — architecture, data model, quiz
  flow, map mode, localization, theming, and contributing.
- **[Hoster wiki](wiki/Hoster/README.md)** — building, static hosting, NixOS, and
  Docker.

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- Vanilla JavaScript (ES modules)
- CSS custom properties for theming
