# Media Feed Generator

A minimal full-stack MVP with a React feed UI, an Express API, MongoDB storage, and optional Redis response caching.

## Run locally

1. Start MongoDB and Redis locally (Redis is optional; feed responses still work without it).
2. In `backend`, copy `.env.example` to `.env`, then run `npm install` and `npm run dev`.
3. In `frontend`, run `npm install` and `npm run dev`.
4. Run `npm run seed` in `backend` to create four sample users and posts. All seeded users use the password `password123` by default; set `SEED_PASSWORD` or `DEMO_PASSWORD` in `backend/.env` to choose another password.

The frontend uses the `demo` account for this MVP. Set `VITE_API_URL` in a frontend `.env` file if the API is hosted elsewhere.

## API contract

- `GET /api/health` → `{ "ok": true }`
- `POST /api/auth/register` with `{ "name": "...", "username": "...", "password": "..." }` creates an account and returns the user plus a JWT.
- `POST /api/auth/login` with `{ "username": "...", "password": "..." }` → `{ "user": { "id": "...", "name": "...", "username": "..." }, "accessToken": "...", "tokenType": "Bearer", "expiresIn": "1h" }`
- `GET /api/feed?limit=10&cursor=...` with `Authorization: Bearer <accessToken>` → `{ "items": [...], "nextCursor": "..." | null }`

Set `JWT_SECRET` to a long random value in `backend/.env` before starting the API. Existing `ACCESS_TOKEN_SECRET` configuration is also accepted. Passwords are hashed before storage; `JWT_EXPIRES_IN` controls access token lifetime (defaults to `1h`). Feed items are selected from the authenticated user and followed authors, ranked by likes and recency, then returned in pages. The cursor is an opaque base64 ID for the last post on the current page. Results are cached in Redis for 30 seconds when Redis is available.
