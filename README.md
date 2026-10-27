# TuneLog

A Last.fm-based music catalog. Search artists, albums and tracks, browse top charts globally or by country, dig into artist biographies and album tracklists, read lyrics, and build your own playlists

## Features

- **Search** — artists, albums, and tracks via the Last.fm API
- **Top charts** — global or filtered by country (Ukraine, US, UK, Germany, Poland, France, Japan, Brazil)
- **Artist pages** — biography, stats, tags, top tracks, top albums, similar artists
- **Album pages** — cover, tracklist, description, and similar albums
- **Track pages** — lyrics (via [LRCLIB](https://lrclib.net)), track description when available, and similar tracks
- **Playlists** — create playlists and add songs to them from anywhere in the app
- **Smart images** — album/track art comes from Last.fm; artist photos fall back to TheAudioDB → Deezer → Wikipedia

## Tech stack

React 19 · TypeScript · Vite · Last.fm API · LRCLIB

## Running locally

Prerequisites: **Node.js 20+** & npm

```bash
git clone https://github.com/stabway/tunelog.git
cd tunelog
npm install
npm run dev
```

### Other scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the dev server with HMR         |
| `npm run build`   | Type-check and build for production   |
| `npm run preview` | Preview the production build locally  |
| `npm run lint`    | Run ESLint                            |
