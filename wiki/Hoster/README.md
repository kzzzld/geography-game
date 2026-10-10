# Hoster wiki

Everything you need to get the game onto a server. The output is a folder of
static files, so almost any host works.

## Contents

- [Building](Building.md) — produce the `dist/` output
- [Static Hosting](Static-Hosting.md) — Vercel and any plain static host
- [NixOS](NixOS.md) — the flake, `nix build`, and the NixOS module
- [Docker](Docker.md) — build and serve with nginx (untested)
- [Troubleshooting](Troubleshooting.md) — common hosting gotchas

## TL;DR

```bash
npm install
npm run build      # → dist/
```

Serve `dist/` with any web server. Make sure unknown paths fall back to
`index.html` (the app is a single page). Or, on NixOS, use the bundled module:

```nix
services.kzzzl-geography-game.enable = true;
```

## What ships

The build is entirely static: HTML, CSS, JS, JSON, SVG, and images. There is no
server-side code, no database, and no environment configuration. The only
runtime network calls the browser makes are to Google Fonts / jsDelivr (for the
typefaces) and `flagcdn.com` (for flag images).

Related: [Developer wiki](../Developer/README.md) · [User wiki](../User/README.md)
