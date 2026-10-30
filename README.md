# Media Feed Generator

A full-stack demo for a personalized media feed. The React app lets users register or sign in, then displays posts from their own account and the accounts they follow. The Express API stores users and posts in MongoDB and uses Redis to cache feed data when Redis is available.

## Features

- Account registration and login with hashed passwords and JWT access tokens.
- Protected feed endpoint; JWT middleware loads the user onto `req.user`.
- Personalized posts from the signed-in user and their followed accounts.
- Ranking based on total likes and post age. The score is `likes × 2 × 0.5^(age in days / 180)`.
- Cursor-based page requests and a React “Load more” button.
- Redis caching of feed result data for 30 seconds. If Redis is unavailable, feed requests continue without caching.
- Seed data with four demo accounts and 189 posts spanning a wide range of ages and like counts.
- Post dates displayed in `DD/MM/YYYY` format.

## Project layout

```text
backend/
  src/
    controllers/       # Authentication and feed handlers
    db/                # MongoDB connection
    middleware/        # JWT authentication middleware
    models/            # Mongoose User and Post models
    routes/            # Authentication and feed routes
    utils/             # API responses/errors, JWT, Redis helpers
    validator/         # Request validation schemas
    seed.js             # Development users and posts
    app.js              # Express app and route mounting
    server.js           # Database, Redis, and HTTP startup
frontend/
  src/
    App.jsx             # Registration, login, and feed UI
    style.css           # UI styles
    main.jsx            # React entry point
```

## Requirements

- Node.js and npm
- MongoDB
- Redis is optional; without it, the feed runs uncached

## Configure and run

Create `backend/.env` with your local settings (use your own values):

```env
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/media_feed
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
```

Keep real secrets in `.env` and out of commits. The API also accepts `ACCESS_TOKEN_SECRET` in place of `JWT_SECRET`.

Start the backend in one terminal:

```bash
cd backend
npm install
npm run dev
```

Optionally seed the development accounts and posts from another terminal:

```bash
cd backend
npm run seed
```

The seed script uses `SEED_PASSWORD`, then `DEMO_PASSWORD`, if either is set in `backend/.env`; otherwise it uses `password123` for all four demo accounts (`demo`, `maya`, `leo`, and `nina`). It refreshes the seeded posts each time it runs.

Start the frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The frontend defaults to `http://localhost:4000` for the API. If the API uses a different port or host, set `VITE_API_URL` in `frontend/.env`, for example `VITE_API_URL=http://localhost:4001`, and restart Vite.

## API routes

All routes are mounted under `/api`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create an account; registration does not sign the user in. |
| `POST` | `/api/auth/login` | No | Verify credentials and return a JWT access token. |
| `GET` | `/api/feed` | Bearer JWT | Get a personalized feed page. |

Registration body:

```json
{ "name": "Sam Lee", "username": "samlee", "password": "your-password" }
```

Login body:

```json
{ "username": "samlee", "password": "your-password" }
```

Feed example:

```text
GET /api/feed?limit=10&cursor=<nextCursor>
Authorization: Bearer <accessToken>
```

`limit` defaults to 10 and is constrained to 1–30. The response uses an envelope with `statusCode`, `data`, `message`, and `success`. A feed response's `data` contains `items` and `nextCursor`.

## Implementation notes

- Feed posts are selected and sorted by creation time in MongoDB, with a query limit of 200. Ranking and page slicing happen in Node.js over that fetched set; the project does not currently use MongoDB's aggregation pipeline.
- The cursor identifies a post in the in-memory ranked set, so pagination is bounded by those 200 fetched posts and is intended for this demo.
- Likes are total post counts, not user-specific interactions.
- Redis caches only the feed result data; the API response envelope is created for each request. The cache TTL is 30 seconds.
- The project has no performance benchmark, so caching is implemented but its speedup has not been measured.
