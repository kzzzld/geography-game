# Flag Quiz

A fast, minimal flag-guessing quiz built with vanilla JavaScript and Vite. Guess the country from its flag, track your score, and customize the look with multiple themes and fonts.

## Features

- 🌍 10-question quizzes randomly drawn from a pool of countries and territories (recognized, disputed, autonomous, and unrecognized)
- 🎯 5 multiple-choice options per question, shuffled each round
- 🏆 Live score tracking with a results screen at the end
- 🎨 9 color themes (Tokyo Night, Nord, Dark, AMOLED, Catppuccin Mocha/Frappé/Latte/Macchiato, Black Metal)
- 🔤 3 font choices (Inter, JetBrains Mono, Iosevka)
- 💾 Theme and font preferences persisted in `localStorage`
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
├── index.html        # App entry HTML
├── main.js           # App logic (quiz flow, rendering, settings)
├── style.css         # Theming and layout styles
├── public/
│   └── data.json      # Quiz data (country names + flag image URLs)
└── package.json
```

> **Note:** Quiz data lives in `public/data.json` so it's copied as-is into the build output and available at runtime via `fetch('./data.json')`. Keep any static assets fetched at runtime inside `public/`.

## Adding or Editing Countries

Edit `public/data.json`. Each entry follows this shape:

```json
{ "country": "Japan", "flag": "https://flagcdn.com/w320/jp.png", "type": "recognized" }
```

- `country` — display name shown as an answer option
- `flag` — URL to the flag image
- `type` — classification (`recognized`, `disputed`, `autonomous`, `unrecognized`) — informational, not currently used to filter quizzes

## Deployment

This is a static Vite app and deploys cleanly to [Vercel](https://vercel.com):

```bash
npm run build
```

Vercel will detect the Vite framework preset automatically and serve the `dist/` output.

## Tech Stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- Vanilla JavaScript (ES modules)
- CSS custom properties for theming
