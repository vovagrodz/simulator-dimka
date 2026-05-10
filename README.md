# PROJECT D.I.M.K.A.

AI dating simulator — single-page HTML game powered by Gemini 2.5 Flash, deployed as a Cloudflare Worker with static assets.

## Live

After deploy: `https://simulator-dimka.<your-account>.workers.dev`

## Architecture

- `public/index.html` — entire frontend (HTML + CSS + JS in one file)
- `worker.js` — Cloudflare Worker entry. Handles `/api/chat` proxy to Gemini, falls through to static assets for everything else
- `wrangler.jsonc` — Workers config with `[assets]` binding to serve `public/`
- Required secret: `GEMINI_API_KEY` (set via `wrangler secret put GEMINI_API_KEY` or via Cloudflare dashboard)
- Optional env: `GEMINI_MODEL` (default `gemini-2.5-flash`)

## Local dev

```bash
npm install
echo "GEMINI_API_KEY=your-key" > .dev.vars
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
npx wrangler secret put GEMINI_API_KEY
```

Or push to `main` if connected via Cloudflare dashboard — auto-deploys.

## Game design

Player is Dimka (28, IT, Wiesbaden, wants to quit smoking). Six girls with distinct archetypes. AI generates 13+ scene story arcs ending in 14 different finales (kiss, sex, smoked-out, told-off, ghosted, etc.). Score-driven branching with a hard ending trigger at scene 13 (client-side fallback ensures every game ends).
