# DevHelp - Developer Problem Solving Platform

DevHelp is a full stack MERN application where developers can post coding errors and receive solutions from other developers.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- API: REST (JSON)

## Features

- User signup, login, and profile API
- Create and browse programming issue posts
- Post details page with code snippet and description
- Submit answers/solutions to a post
- Threaded discussion comments under each answer
- Best answer acceptance by post owner
- Upvote toggle system with reputation points (+5/-5)
- Profile page to view user posts
- Docker Compose setup for full local stack
- Paginated discussion comments with reply depth limit
- Comment sort modes: oldest, newest, top
- Thread collapse/expand controls
- Production distroless Docker setup

## Project Structure

```text
DevHelp/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      App.jsx
      main.jsx
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Important API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `GET /api/posts/user/:userId`
- `GET /api/answers/:postId`
- `POST /api/answers/:postId`
- `PATCH /api/answers/upvote/:answerId`
- `PATCH /api/answers/accept/:answerId`
- `GET /api/comments/answer/:answerId`
- `POST /api/comments/answer/:answerId`

### Comment Pagination Query Params

- `page` (default: `1`)
- `limit` (default: `10`, max: `50`)
- `maxDepth` (default: `3`)

## Run with Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

## Run Production Compose

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

To stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Ready-to-Use Quick Start

1. Create production env file.

```bash
cp .env.prod.example .env.prod
```

Or run the interactive initializer:

```powershell
./scripts/init-prod-env.ps1
```

1. Update these keys in `.env.prod`.

- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `DEVHELP_DOMAIN` (if using Caddy edge)
- `VITE_API_URL`

1. Run preflight check (PowerShell).

```powershell
./scripts/preflight.ps1
```

1. Start production stack.

PowerShell:

```powershell
./scripts/deploy-prod.ps1
```

PowerShell with HTTPS edge proxy (Caddy):

```powershell
./scripts/deploy-prod.ps1 -WithEdge
```

Linux/macOS:

```bash
bash ./scripts/deploy-prod.sh
bash ./scripts/deploy-prod.sh --with-edge
```

1. Run smoke test.

```powershell
./scripts/smoke-test.ps1 -BaseUrl http://localhost:5000
```

## Hosting Ready Checklist

- MongoDB Atlas cluster created
- Backend environment variables set
- Frontend `VITE_API_URL` points to deployed backend `/api`
- Backend `CLIENT_ORIGIN` points to deployed frontend domain
- JWT secret is long/random and private
- Health endpoints configured in platform (`/api/health`, `/api/ready`)

## Deploy Option 1: Render (Recommended)

Use [render.yaml](render.yaml).

1. Push this repo to GitHub.
1. In Render, create Blueprint deploy from repo.
1. Set secret env vars.

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN` (your frontend URL)
- `VITE_API_URL` (your backend URL + `/api`)

1. Deploy both services.

Frontend SPA rewrite is already configured.

## Deploy Option 2: Vercel + Render

- Frontend: deploy [frontend](frontend) folder to Vercel.
- Vercel SPA rewrites are configured in [frontend/vercel.json](frontend/vercel.json).
- Backend: deploy [backend](backend) folder on Render web service.

Required variables:

- Backend: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production`
- Frontend: `VITE_API_URL=https://your-backend-domain.com/api`

## Deploy Option 3: VPS with Docker Compose

1. Install Docker and Docker Compose on VPS.
1. Clone repo on server.
1. Export strong secret before run.

```bash
export JWT_SECRET='replace-with-very-strong-secret'
docker compose -f docker-compose.prod.yml up --build -d
```

1. Put Nginx/Caddy in front for TLS with your domain.
1. Point DNS to VPS.

## Production Files

- Backend production image: [backend/Dockerfile.prod](backend/Dockerfile.prod)
- Frontend production image: [frontend/Dockerfile.prod](frontend/Dockerfile.prod)
- Frontend static server: [frontend/prod-server.mjs](frontend/prod-server.mjs)
- Production compose: [docker-compose.prod.yml](docker-compose.prod.yml)
- Production env template: [.env.prod.example](.env.prod.example)
- Frontend production env template: [frontend/.env.production.example](frontend/.env.production.example)
- Deploy script (PowerShell): [scripts/deploy-prod.ps1](scripts/deploy-prod.ps1)
- Deploy script (bash): [scripts/deploy-prod.sh](scripts/deploy-prod.sh)
- Preflight script: [scripts/preflight.ps1](scripts/preflight.ps1)
- Smoke test script: [scripts/smoke-test.ps1](scripts/smoke-test.ps1)

## CI/CD Setup (GitHub Actions)

Workflows added:

- [.github/workflows/ci.yml](.github/workflows/ci.yml)
- [.github/workflows/deploy-render.yml](.github/workflows/deploy-render.yml)
- [.github/workflows/deploy-staged-render.yml](.github/workflows/deploy-staged-render.yml)
- [.github/workflows/post-deploy-smoke.yml](.github/workflows/post-deploy-smoke.yml)

CI workflow runs on every push/PR:

- Backend dependency install and basic runtime check
- Frontend production build check
- Dockerfile security config scan (Trivy SARIF upload)

Render deploy workflow triggers after push to main/master (or manually).
Post-deploy smoke workflow validates live frontend/backend endpoints.
Staged deploy workflow updates backend first, waits for readiness, then deploys frontend.

### Required GitHub Secrets

Set these in GitHub repo settings before enabling auto-deploy:

- `RENDER_DEPLOY_HOOK_BACKEND`
- `RENDER_DEPLOY_HOOK_FRONTEND`
- `BACKEND_BASE_URL` (example: `https://your-backend.onrender.com`)
- `FRONTEND_BASE_URL` (example: `https://your-frontend.onrender.com`)
- `SLACK_WEBHOOK_URL` (optional failure alert)

If deploy secrets are missing, deploy step safely skips those services.

## Production Deploy Flow (Recommended)

1. Push code to GitHub.
1. CI workflow validates backend/frontend and uploads security scan results.
1. Deploy workflow triggers Render hooks.

1. Verify backend health.

- `/api/health`
- `/api/ready`

1. Verify frontend loads and API calls succeed.

## Ops Playbooks

- Branch protection checklist: [ops/branch-protection-checklist.md](ops/branch-protection-checklist.md)
- Branch protection step-by-step: [ops/github-branch-protection-steps.md](ops/github-branch-protection-steps.md)
- Rollback guide: [ops/rollback-playbook.md](ops/rollback-playbook.md)
- Monitoring setup: [ops/monitoring-setup.md](ops/monitoring-setup.md)
- Render env template: [ops/render-env-template.md](ops/render-env-template.md)
- Render click-by-click guide: [ops/render-click-by-click-guide.md](ops/render-click-by-click-guide.md)
- Cloudflare production settings: [ops/cloudflare-production-settings.md](ops/cloudflare-production-settings.md)

## Monitoring Stack

Start Uptime Kuma locally/on VPS:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Open: `http://localhost:3001`

## Domain + HTTPS Reverse Proxy

### Option A: Caddy (Automatic TLS, Recommended)

Files:

- [docker-compose.edge.yml](docker-compose.edge.yml)
- [deploy/caddy/Caddyfile](deploy/caddy/Caddyfile)

Run with production stack:

```bash
export DEVHELP_DOMAIN=your-domain.com
docker compose -f docker-compose.prod.yml -f docker-compose.edge.yml up -d --build
```

### Option B: Nginx (Manual TLS Certs)

File:

- [deploy/nginx/devhelp.conf](deploy/nginx/devhelp.conf)

Use this when you already manage certificates (for example with Certbot).

## Notes

- Ensure MongoDB is running locally or use MongoDB Atlas URI in backend `.env`.
- Passwords are hashed using bcrypt.
- JWT auth is used for protected endpoints.
- Backend security middleware added: helmet, rate-limit, compression.
- Readiness endpoint checks MongoDB connectivity before marking service ready.

## Next Enhancements

- Comment threads on answers
- Accept/best answer marker
- Search and tag filters
- Reputation and badges
- Notification system
