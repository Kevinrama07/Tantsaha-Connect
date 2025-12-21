# Tantsaha — Node.js backend

This folder contains a minimal Express-based backend for local development.

Quick start

1. Copy `.env.example` to `.env` and edit values if needed.
2. Install dependencies: `npm install` (run inside the `server/` folder).
3. Run in dev mode: `npm run dev` or `npm start` to run without nodemon.

Available routes

- `GET /api/health` — health check
- `POST /api/echo` — echoes JSON body
- `GET /api/favorites` — placeholder favorites endpoint

Next steps

- Integrate with Supabase or another DB to persist data.
- Add authentication middleware and secrets via environment variables.
