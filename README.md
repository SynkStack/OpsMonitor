# OpsMonitor

A monitoring service that health-checks other services, built for NovaStack Technologies.

## Run
```bash
npm install
npm start            # monitor on :3000
npm run start:fake   # fake target on :4000
npm test
```
Requires Node 22 or higher (uses the built-in `node:sqlite`).

Copy `.env.example` to `.env` to configure `PORT` and `DB_FILE`.

## Check statuses
- **up**: 2xx response within 1s
- **degraded**: 2xx response slower than 1s
- **down**: non-2xx, timeout (5s) or network error

## Targets API
| Method | Path | Description |
|---|---|---|
| POST | `/targets` | Register a target (`name`, `url`, `interval_sec`) |
| GET | `/targets` | List targets |
| GET | `/targets/:id` | Get one target |
| DELETE | `/targets/:id` | Remove a target |
| GET | `/targets/:id/results` | Latest 20 check results |
| GET | `/health` | Monitor liveness |

## Scheduler
Every second the scheduler starts a check for each active target that is due. A target never has two checks running at the same time.

## Fake target
`npm run start:fake` starts a test service on :4000:
- `POST /admin/down` makes it return 500
- `POST /admin/up` makes it healthy again
- `POST /admin/slow/:ms` adds delay to simulate degraded

## Incidents and alerts
- 3 consecutive failed checks open one incident; the first successful check closes it
- `GET /incidents` lists incidents, `GET /incidents?open=true` lists open ones
- Alerts go to `ALERT_WEBHOOK_URL` if set, otherwise they are logged to the console

## Stats and metrics
- `GET /targets/:id/stats?hours=24`: uptime %, average latency and last status (`degraded` counts as available)
- `GET /metrics`: Prometheus format: `opsmonitor_checks_total`, `opsmonitor_check_latency_ms`, `opsmonitor_target_up`, `opsmonitor_open_incidents`