# OpsMonitor

Monitoring service that health-checks other services.

## Run
- `npm install`
- `npm start` (monitor on :3000)
- `npm run start:fake` (fake target on :4000)
- `npm test`

## Check statuses
- **up**: 2xx response within 1s
- **degraded**: 2xx response slower than 1s
- **down**: non-2xx, timeout (5s) or network error