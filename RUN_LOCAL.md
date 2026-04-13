# Run Locally

## Requirements

- Node.js 20 or newer — download from https://nodejs.org

## Steps

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build the app
npm run build

# 3. Start the app
npm start
```

Open **http://localhost:3000** in your browser.

## What you'll see

- **Dashboard** (`/`) — overview page
- **Analyze** (`/analyze`) — pick a location and run an analysis
- **History** (`/history`) — past analyses
- **Data** (`/data`) — upload and view comparable properties
- **Settings** (`/settings`) — configuration

## Optional: AI-enhanced memos

Create a file called `.env.local` in the project root:

```
OPENAI_API_KEY=sk-your-key-here
```

The app works without this — you'll get a deterministic strategy memo instead.
