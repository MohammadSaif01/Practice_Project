# Monitoring Setup

## Option A: Uptime Kuma (Quick)

1. Start monitor stack:

```bash

docker compose -f docker-compose.monitoring.yml up -d
```

1. Open `http://localhost:3001`.
1. Add monitors:
   - `GET /api/health`
   - `GET /api/ready`
   - Frontend root URL
1. Configure notification channel (Email/Slack/Discord).

## Option B: Managed Uptime Service

Use UptimeRobot, Better Stack, or Pingdom with 1-minute checks:

- Backend health URL
- Backend readiness URL
- Frontend URL

## Recommended Alert Thresholds

- 2 consecutive failures => warning
- 5 consecutive failures => critical
- Recovery notification enabled
