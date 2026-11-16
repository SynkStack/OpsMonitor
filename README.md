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
Every second the