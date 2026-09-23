# ABC Champ — Alphabet Adventure

Kids educational game (3–7 yrs) — 12 levels to learn A–Z. Works **offline** and is **installable** as a PWA.

**Levels:** Type & Learn (⌨️) → Trace & Write (✏️) → Picture Match → Listen & Tap → Missing Letter → Word Builder → Quiz Champ → Big & Small → Memory Flip → Sort the Line → Spell Star → Turbo Type ⚡ (30s typing speed test with CPM/WPM)

**Tech:** Pure HTML/CSS/JS, no build, `localStorage` for progress, Web Audio + Speech Synthesis (EN/HI), Canvas tracing, PWA via `manifest.json` + `sw.js`.

## Run locally
```bash
python -m http.server 8000
# open http://localhost:8000/
```

## Deploy to Vercel via GitHub

### 1. Push to GitHub
```bash
cd "C:\Users\PC\Desktop\kids game"
git init
git add .
git commit -m "ABC Champ v3 — 12 levels PWA"
# create repo on github.com (or via gh CLI) then:
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/abc-champ.git
git push -u origin main
```

Or with GitHub CLI:
```bash
gh auth login
gh repo create abc-champ --public --source=. --remote=origin --push
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. **Import Git Repository** → select `abc-champ`
3. Framework Preset: **Other** (static)
4. No build command, Output directory: `.` (root)
5. Deploy — Vercel serves `index.html` statically (`vercel.json` included)

### 3. Offline / Install
- Served over HTTPS (Vercel) → browser shows **Install App** prompt.
- Home screen has **⬇️ Install App** button when `beforeinstallprompt` fires.
- Service worker `sw.js` caches all assets (`abc-champ-v3`) for offline use.
- Test offline: DevTools → Application → Service Workers → Offline, reload.

### Updating
Push to `main` → Vercel auto-deploys. Bump `CACHE_NAME` in `sw.js` if you change assets.

### Icons
`icons/icon-192.png` (2012 B) and `icons/icon-512.png` (5479 B) are placeholders — replace with your own 192/512 PNGs for store listing.
