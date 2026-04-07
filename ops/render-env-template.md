# Render Environment Template

Use this template when configuring Render services.

## Backend Service: devhelp-backend

- NODE_ENV=production
- PORT=5000
- MONGO_URI="mongodb+srv://USERNAME:PASSWORD@CLUSTER-URL/devhelp?retryWrites=true&w=majority"
- JWT_SECRET="GENERATE_A_LONG_RANDOM_SECRET"
- JWT_EXPIRES_IN=7d
- RATE_LIMIT_MAX=300
- `CLIENT_ORIGIN="https://YOUR-FRONTEND-DOMAIN"`

## Frontend Service: devhelp-frontend

- `VITE_API_URL="https://YOUR-BACKEND-DOMAIN/api"`

## Render Deploy Hook Secrets for GitHub Actions

- `RENDER_DEPLOY_HOOK_BACKEND="https://api.render.com/deploy/srv-xxxx?key=xxxx"`
- `RENDER_DEPLOY_HOOK_FRONTEND="https://api.render.com/deploy/srv-yyyy?key=yyyy"`

## Smoke Test Secrets for GitHub Actions

- `BACKEND_BASE_URL="https://YOUR-BACKEND-DOMAIN"`
- `FRONTEND_BASE_URL="https://YOUR-FRONTEND-DOMAIN"`
- SLACK_WEBHOOK_URL="OPTIONAL"

## Security Notes

- Never commit real secrets.
- Rotate JWT_SECRET if leaked.
- Prefer MongoDB Atlas IP allow-list + database user with least privilege.
