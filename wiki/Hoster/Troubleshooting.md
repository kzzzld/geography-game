# Troubleshooting

Common issues when hosting or building the game.

## The page loads but there's no quiz data

The app fetches `./data.json` at runtime. If that 404s, you'll see the
`error.loadFailed` card.

- Confirm `dist/data.json` exists after `npm run build`.
- Make sure `data.json` (and `world.svg`, `focus.json`) is served from the same
  directory as `index.html`, since the URLs are relative.
- Check that your web server hasn't blocked JSON MIME types.

## Blank map in Map mode

Map questions fetch `./world.svg` and `./focus.json`. Failures are swallowed, so
a missing map just shows an empty prompt.

- Verify both files are present in `dist/`.
- Check the browser console for network errors. Flag images come from
  `flagcdn.com` and fonts from Google Fonts / jsDelivr — an offline box will
  still play, but flags and fonts may not render.

## 404s on refresh / direct URLs

The app is a single page and should serve `index.html` for unknown paths. Add an
SPA fallback:

- **nginx:** `try_files $uri $uri/ /index.html;`
- **Apache:** `FallbackResource /index.html`

## Nix build fails with a hash mismatch

`nix build` will fail if `npmDepsHash` in `flake.nix` doesn't match the current
`package-lock.json`. That happens whenever dependencies change. Update the hash
(the error message prints the correct value) and commit it.

## nginx under systemd can't write its access log

The NixOS module **disables the access log** (`access_log off;`) and logs to
stderr, because the hardened `DynamicUser` sandbox has no writable location for
it. If you write your own unit, either do the same or give the service a
writable log directory.

## Service binds but isn't reachable from outside

By design the NixOS module binds to `127.0.0.1` only. Put a reverse proxy
(nginx, Caddy, …) in front, or change the listen address in a custom unit.

## Fonts look wrong

Fonts are loaded from external CDNs in `index.html`. On an air-gapped host they
won't load and the browser falls back to the `--font-family` stack's system
fonts. To self-host, vendor the font files and drop the CDN links.

## Vite dev server rejects my hostname

`vite.config.js` has an `allowedHosts` allowlist. Add your hostname there when
using a tunnel or remote preview; otherwise Vite responds with "Blocked request".

## Timed mode feels too fast/slow

It's a setting, not a bug. Default is 15 seconds per question; change it in the
clock popover, [Settings](../User/Settings.md), or with `:time 30`. Turn it off
with `:time off`.

Related: [Building](Building.md) · [Static Hosting](Static-Hosting.md) ·
[NixOS](NixOS.md) · [Docker](Docker.md)
