# Render Deploy Guide (Click-by-Click)

## Prerequisites

1. GitHub repository connected to Render.
1. MongoDB Atlas cluster and connection string ready.
1. Backend and frontend domains planned.

## Step A: Create Backend Service

1. Open Render dashboard.
1. Click New and select Web Service.
1. Select your GitHub repo.
1. Configure values.

- Name: devhelp-backend
- Root Directory: backend
- Environment: Node
- Build Command: npm install
- Start Command: npm start

1. Add environment variables.

- NODE_ENV=production
- PORT=5000
- MONGO_URI=your_atlas_connection_string
- JWT_SECRET=your_long_random_secret
- JWT_EXPIRES_IN=7d
- RATE_LIMIT_MAX=300
- CLIENT_ORIGIN=your_frontend_domain_https

1. Create Web Service.
1. Wait until deploy succeeds.
1. Verify endpoints.

- your_backend_domain/api/health
- your_backend_domain/api/ready

## Step B: Create Frontend Service

1. Click New and select Static Site.
1. Select the same repository.
1. Configure values.

- Name: devhelp-frontend
- Root Directory: frontend
- Build Command: npm install and npm run build
- Publish Directory: dist

1. Add environment variable.

- VITE_API_URL=your_backend_domain_api

1. Create Static Site.
1. Verify frontend loads and API calls work.

## Step C: Add Auto Deploy Hooks

1. Open backend service in Render.
1. Go to Settings and find Deploy Hook.
1. Copy hook URL.
1. Repeat for frontend service.
1. In GitHub repo, open Settings and Secrets and variables and Actions.
1. Add secrets.

- RENDER_DEPLOY_HOOK_BACKEND
- RENDER_DEPLOY_HOOK_FRONTEND
- BACKEND_BASE_URL
- FRONTEND_BASE_URL

1. Trigger GitHub workflow manually once to validate integration.

## Step D: Smoke and Observability

1. Run Post Deploy Smoke Test workflow.
1. Confirm all checks pass.
1. Configure alerting using SLACK_WEBHOOK_URL optional secret.
