# 🎧 Spotify Clone — Single-File Web Player

A Spotify-style web player (single `index.html`) that streams music from **YouTube**.
No build step, no backend, no `npm` — just open the file or deploy it anywhere.

## ▶ Run locally
Double-click `index.html`, or serve it:
```bash
npx serve .          # then open http://localhost:3000
# or
python3 -m http.server 8080
```

## ▲ Deploy to Vercel

### Option A — Vercel Dashboard (easiest)
1. Go to https://vercel.com and sign in (GitHub/Google).
2. Click **"Add New…" → Project**.
3. Import your Git repo (push this `spotify-web/` folder to GitHub first) **or** use **"Deploy Without Git"** / Drag-and-drop.
4. Set the **Root Directory** to `spotify-web` (if deploying the whole repo).
5. Framework preset: **"Other"** (it's a static site — no build command).
6. Click **Deploy**. Done — you'll get a `https://your-app.vercel.app` URL.

### Option B — Vercel CLI
```bash
npm i -g vercel
cd spotify-web
vercel          # preview
vercel --prod   # production
```

### Option C — Drag & Drop (fastest)
1. Open https://vercel.com/new
2. Drag the entire `spotify-web/` folder (or just `index.html`) onto the page.
3. Vercel deploys it instantly as a static site.

## ⚙ Optional: full YouTube search
The player plays a built-in catalog of ~40 popular songs out of the box.
To unlock **full unlimited YouTube search**, click the **⚙ gear icon** (top-right) and
paste a free [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key.
The key is stored only in the visitor's browser (localStorage).
