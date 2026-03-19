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
| `JWT_SECRET` | Secret for signing JWTs |
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
| `POST` | `/superset/` | Ingest facility data | Bearer JWT |

### Payload Fields

`mfl_code`, `timestamp`, `visits`, `workload`, `payments`, `inventory`, `diagnosis`, `billing`, `bed_management`, `mortality`, `wait_time`, `immunization`, `staff_count`, `waivers`, `version`, `sha_enrollments`

## Migrations

Sequelize migrations run automatically on container startup. To run manually:

```bash
npx sequelize-cli db:migrate
```
