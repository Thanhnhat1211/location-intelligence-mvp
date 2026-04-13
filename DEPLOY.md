# Deploy to Render

## Option A: Blueprint (recommended)

1. Push this repo to GitHub (public or private).
2. Go to [Render Dashboard](https://dashboard.render.com) > **New** > **Blueprint**.
3. Connect your GitHub repo.
4. Render reads `render.yaml` and creates the service + persistent disk automatically.
5. In the Render dashboard, set `OPENAI_API_KEY` if you want AI-enhanced strategy memos (optional).
6. Deploy.

## Option B: Manual setup

1. **New Web Service** > connect your GitHub repo.
2. **Runtime**: Node
3. **Build command**: `npm install && npm run build`
4. **Start command**: `npm start`
5. **Environment variables**:
   | Variable | Required | Value |
   |---|---|---|
   | `DATA_DIR` | Yes | `/var/data/location-intel` |
   | `NODE_ENV` | Auto | `production` |
   | `OPENAI_API_KEY` | No | Your OpenAI key (enables AI memos) |
6. **Persistent Disk**:
   - Name: `data`
   - Mount path: `/var/data/location-intel`
   - Size: 1 GB
7. **Health check path**: `/api/health`

## Post-deploy checklist

1. Open `https://<your-app>.onrender.com/` — dashboard loads.
2. Visit `/api/health` — returns `{"status":"healthy"}`.
3. Go to `/analyze`, pick a location, run analysis — result page shows scores + strategy memo.
4. Visit `/history` — the analysis you just ran appears.
5. Visit `/data` — comps page loads (empty until you upload).
6. Visit `/settings` — settings page loads.

## Notes

- The app works fully without `OPENAI_API_KEY`. The deterministic engine generates all scores and a baseline strategy memo.
- The persistent disk keeps `analyses.json` and `comps.json` across deploys. Without it, data resets on every deploy.
- Node version is pinned via `.nvmrc` (20).
