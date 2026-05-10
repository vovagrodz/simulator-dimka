# PROJECT D.I.M.K.A.

AI dating simulator — single-page HTML game powered by Gemini 2.5 Flash, hosted on Cloudflare Pages.

## Live

https://simulator-dimka.pages.dev (after deploy)

## Architecture

- `index.html` — entire frontend (HTML + CSS + JS in one file)
- `functions/api/chat.js` — Cloudflare Pages Function that proxies `/api/chat` POST requests to Gemini API
- Secret: `GEMINI_API_KEY` (set in Cloudflare Pages dashboard → Settings → Environment variables → Production)

## Local dev

```bash
npx wrangler pages dev . --port 8090
```

Set `GEMINI_API_KEY` in `.dev.vars` (gitignored):

```
GEMINI_API_KEY=your-key
```

## Deploy

Push to `main` — Cloudflare Pages auto-deploys.

## Game design

Player is Dimka (28, IT, Wiesbaden, wants to quit smoking). Six girls with distinct archetypes. AI generates 13+ scene story arcs ending in 14 different finales (kiss, sex, smoked-out, told-off, ghosted, etc.). Score-driven branching with hard ending trigger at scene 13.
