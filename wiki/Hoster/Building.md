# Building

The project is a standard Vite app. The build produces a self-contained `dist/`
folder.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (the Docker and Nix setups pin Node 22)
- npm

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Output goes to `dist/`. It contains:

- `index.html` (with hashed asset references)
- The bundled JS and CSS
- Everything from `public/` copied verbatim: `data.json`, `world.svg`,
  `focus.json`, favicons, …

Because `public/` assets are fetched by **relative** URL at runtime
(`./data.json`), the build works from any base path. If you need to serve it
from a subdirectory and your host doesn't handle relative URLs, you can set
Vite's `base` option in `vite.config.js`.

## Development server

```bash
npm run dev
```

Serves at `http://localhost:5173` with hot reload. `vite.config.js` contains an
`allowedHosts` list, so add your tunnel/preview hostname there if Vite rejects
it.

## Preview a build locally

```bash
npm run preview
```

Serves the built `dist/` so you can check the production output before
deploying.

## Nix

If you use Nix, `nix build` produces the same output as a store path — see
[NixOS](NixOS.md).

## Docker

The `Dockerfile` runs the build inside the image — see [Docker](Docker.md).

Related: [Static Hosting](Static-Hosting.md) · [NixOS](NixOS.md) · [Docker](Docker.md)
