# Rollback Playbook

## Trigger Conditions

- Post-deploy smoke test fails
- Elevated error rates after deployment
- Critical user-facing functionality breaks

## Render Rollback (Managed Hosting)

1. Open Render dashboard.
1. Select service (`devhelp-backend` or `devhelp-frontend`).
1. Go to Deploys.
1. Select previous healthy deploy.
1. Click `Redeploy`.
1. Verify:
   - Backend: `/api/health`, `/api/ready`
   - Frontend home page load and API requests

## VPS Rollback (Docker Compose)

1. Find previous image tag.
1. Update image tag in compose file.
1. Deploy previous version:

```bash

docker compose -f docker-compose.prod.yml pull

docker compose -f docker-compose.prod.yml up -d
```

1. Validate service health endpoints.

## Data Safety Guidelines

- Never rollback database blindly without backup validation.
- Keep MongoDB backups before destructive migrations.
- Use backward-compatible schema changes where possible.
