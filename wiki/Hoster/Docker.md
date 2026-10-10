# Docker

> **{UNTESTED}** — the `Dockerfile` and `compose.yml` are provided as a starting
> point and have not been verified. Treat them as a template.

## Files

### `Dockerfile`

A two-stage build:

1. **Build stage** — `node:22-alpine`, copies `package.json` /
   `package-lock.json`, runs `npm ci`, copies the source, runs `npm run build`.
2. **Serve stage** — `nginx:alpine`, copies `/app/dist` into
   `/usr/share/nginx/html`, exposes port 80.

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### `compose.yml`

```yaml
services:
  geography-game:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Maps host port `8080` to the container's nginx on port 80.

### `.dockerignore`

Excludes `node_modules`, `dist`, `.vite`, `.git`, `.gitignore`, and `result`
from the build context.

## Usage

Run with Docker Compose:

```bash
docker compose up --build
```

The app is then at `http://localhost:8080`.

Or build and run the image directly:

```bash
docker build -t kzzzl-geography-game .
docker run --rm -p 8080:80 kzzzl-geography-game
```

## Caveats

- The nginx image uses its **default** server config, which already serves
  `index.html` for `/`. It does *not* add a `try_files` SPA fallback; the game
  works without it, but add one if you introduce deep links.
- Change the `8080:` host port if it's already in use.
- The build context includes `public/`, so all runtime assets are baked in — no
  volumes needed.

Related: [Building](Building.md) · [Troubleshooting](Troubleshooting.md)
