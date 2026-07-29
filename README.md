# KenyaEMR Visualization Receiver

A REST API that receives health data payloads from KenyaEMR 3.x facilities and stores them in a MySQL database for visualization via Apache Superset.

## Tech Stack

- **Runtime**: Node.js + Express 4.x
- **Database**: MySQL via Sequelize ORM
- **Auth**: JWT via Passport.js
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL

### Installation

```bash
npm install
```

Copy `.env.save` to `.env` and fill in your values:

```bash
cp .env.save .env
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP server port |
| `DB_SERVER` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `ACCESS_JWT_SECRET` | Shared secret for verifying Bearer JWTs on read endpoints (`GET /spot/:fid`) |
| `HIS_LIST` | Base URL for the facility locator API |
| `LOG_LEVEL` | Winston log level (`debug`, `info`, `warn`, `error`) |
| `NODE_ENV` | `development` or `production` |

### Run

```bash
# Development
npm run dev

# Production
node index.js
```

## Docker

```bash
docker compose up --build
```

## API

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/superset/` | Ingest facility data (legacy) | None |
| `POST` | `/api/v2/dataset` | Ingest a single typed dataset (`dataset_type` + `data`) | None |
| `GET` | `/spot/:fid` | SHA claims for a facility, aggregated by date + scheme | Bearer JWT |

### Third-party read access

`GET /spot/:fid` requires an `Authorization: Bearer <token>` header. Tokens are JWTs signed with
`ACCESS_JWT_SECRET`. Issue one for a partner with:

```bash
node scripts/generate_access_token.js spot-hie 365d
```

Then share it over a secure channel:

```bash
curl -H "Authorization: Bearer <token>" https://<host>/spot/FID-47-105963-0
```

> **Note:** any valid token can read **any** FID — there is no per-client scoping. Revoking a single
> partner is not possible; you must rotate `ACCESS_JWT_SECRET`, which invalidates all issued tokens.
> Prefer a bounded expiry so leaked tokens age out.

### Payload Fields

`mfl_code`, `timestamp`, `visits`, `workload`, `payments`, `inventory`, `diagnosis`, `billing`, `bed_management`, `mortality`, `wait_time`, `immunization`, `staff_count`, `waivers`, `version`, `sha_enrollments`

## Migrations

Sequelize migrations run automatically on container startup. To run manually:

```bash
npx sequelize-cli db:migrate
```
