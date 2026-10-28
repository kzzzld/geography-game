# Static Hosting

The build output is a folder of static files. Any web server or static host can
serve it — the only requirement is that the app can fetch `./data.json`,
`./world.svg`, and `./focus.json` relative to `index.html`.

## Vercel

Vercel detects the Vite framework preset automatically:

1. Connect the repository.
2. Build command: `npm run build` (auto-detected).
3. Output directory: `dist` (auto-detected).

No extra configuration is required.

## Netlify / Cloudflare Pages / GitHub Pages

- **Build command:** `npm run build`
- **Publish directory:** `dist`

For a project served from a subpath (e.g. GitHub Pages project sites), set
`base` in `vite.config.js`, e.g. `base: '/geography-game/'`, so asset and fetch
URLs resolve correctly.

## Generic nginx

```nginx
server {
    listen 80;
    server_name geog.example.com;
    root /var/www/geography-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

The `try_files … /index.html` fallback matters for a single-page app: unknown
paths should return the app shell rather than a 404. (The game itself keeps its
state in the URL-free DOM, so deep links aren't used, but the fallback is still
the correct default.)

Caching tip: the hashed JS/CSS assets under `dist/assets/` can be cached
aggressively, while `index.html` should not be — see [Troubleshooting](Troubleshooting.md).

## Generic Apache

```apache
DocumentRoot /var/www/geography-game

<Directory /var/www/geography-game>
    Require all granted
    FallbackResource /index.html
</Directory>
```

## Putting it behind a reverse proxy

If you run the [NixOS service](NixOS.md) it binds to `127.0.0.1` and expects a
reverse proxy in front. A minimal nginx TLS vhost:

```nginx
server {
    listen 443 ssl;
    server_name geog.example.com;

    # ssl_certificate / ssl_certificate_key ...

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

Related: [Building](Building.md) · [NixOS](NixOS.md) · [Troubleshooting](Troubleshooting.md)

## Explore

Explore requires browser access to Panoramax metadata/photo origins and raster
tiles. API, tile URL, attribution, cache policy and CSP details are documented
in [Explore hosting](../User/Explore.md#hosting). No backend is required.
