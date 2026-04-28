# DataSist

**AI data center intelligence** — map, compare, and analyze hyperscale and colocation facilities (capacity, grid risk, water, community impact, renewables, and more). Part of the [Aliasist](https://aliasist.com) suite.

**Live:** [datasist-frontend.pages.dev](https://datasist-frontend.pages.dev)  
**API (production):** Cloudflare Worker in [datasist-api](https://github.com/aliasist/datasist-api) (this repo is the full-stack app used for local dev and some deployments).

## Stack

- **Frontend:** React, Vite, Tailwind, shadcn-style UI, Leaflet maps  
- **Backend:** Express 5, REST API under `/api/*`  
- **Data:** SQLite (`datasist.db`) via Drizzle + `better-sqlite3` (seeded on first run)  
- **AI:** Groq (`GROQ_API_KEY`) for facility chat — optional for browsing

## Local development

```bash
npm install
cp .env.example .env   # set GROQ_API_KEY for /api/ai/chat
npm run dev
```

Open **http://localhost:5000** (or set `PORT`).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Express + Vite dev server |
| `npm run build` | Production bundle to `dist/` |
| `npm start` | Run production build |
| `npm run check` | Typecheck |
| `npm run db:push` | Drizzle migrations (see `drizzle.config.ts`) |

## License

MIT (see repository).
