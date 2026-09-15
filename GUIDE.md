# Migration Guide: KenyaEMR Visualization Receiver — MySQL to Neon Postgres

## Overview

This guide covers every change needed to migrate the application's database layer from **MySQL to Neon Postgres**.

The project uses **Sequelize ORM**, which abstracts most database-specific details. However, the database driver, dialect configuration, connection pooling, and a few migration patterns require updates.

> **Important:** This migration targets **Neon Postgres** as the managed database service. PostgreSQL does not need to be installed or hosted locally for this setup.

---

## Prerequisites

* Node.js 20+
* A **Neon Postgres** database
* Neon Postgres connection string or database credentials
* Sequelize CLI (`npx sequelize-cli` is already included in `devDependencies`)

---

## Step 1: Replace the Database Driver

### File: `package.json`

Remove the MySQL driver and add the PostgreSQL drivers:

```json
{
  "pg": "^8.11.3",
  "pg-hstore": "^2.13.3"
}
```

Remove:

```json
"mysql2": "^3.6.5"
```

Install the dependencies:

```bash
npm uninstall mysql2
npm install pg pg-hstore
```

### Why `pg`?

`pg` is the standard PostgreSQL driver used by Sequelize when connecting to Neon Postgres.

`pg-hstore` is included for Sequelize PostgreSQL compatibility where HStore support is required.

---

## Step 2: Update Sequelize Instance Configuration

### File: `db_config.js`

### Before

```javascript
const sequelize = new Sequelize(database, username, password, {
  host: db_server,
  port: port,
  dialect: "mysql",

  dialectOptions: {
    connectTimeout: 4000000,
  },

  pool: {
    max: 1000,
    min: 0,
    idle: 900000,
  },

  logging: false,
});
```

### After

Configure Sequelize to connect to Neon Postgres:

```javascript
const sequelize = new Sequelize(database, username, password, {
  host: db_server,
  port: port,
  dialect: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },

    connectTimeout: 4000000,
  },

  pool: {
    max: 20,
    min: 0,
    idle: 10000,
    acquire: 60000,
  },

  logging: false,
});
```

### Changes Explained

| Configuration        | Change                   | Reason                                         |
| -------------------- | ------------------------ | ---------------------------------------------- |
| `dialect`            | `"mysql"` → `"postgres"` | Uses the PostgreSQL driver                     |
| `ssl.require`        | Added                    | Neon requires SSL/TLS connections              |
| `rejectUnauthorized` | `false`                  | Required for the Neon connection configuration |
| `pool.max`           | `1000` → `20`            | Prevents excessive database connections        |
| `pool.idle`          | `900000` → `10000`       | Closes idle connections sooner                 |
| `pool.acquire`       | Added                    | Maximum time to wait for a pool connection     |

### Recommended Connection Pool

```javascript
pool: {
  max: 20,
  min: 0,
  idle: 10000,
  acquire: 60000,
}
```

The pool size should be adjusted according to the Neon plan and application's actual workload.

---

## Step 3: Configure Neon Postgres Environment Variables

The existing environment variable structure can be retained:

```env
DB_SERVER=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

These values should come from the **Neon Postgres project**.

Example:

```env
DB_SERVER=your-neon-host
DB_PORT=5432
DB_USER=your-neon-user
DB_PASSWORD=your-neon-password
DB_NAME=your-neon-database
```

> **Do not use credentials for a locally installed PostgreSQL server.** These variables should point to the Neon Postgres database.

### Neon Connection String

Neon also provides a PostgreSQL connection string similar to:

```text
postgresql://user:password@host/database
```

If the application already expects separate environment variables, continue using:

```env
DB_SERVER=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

There is no requirement to install PostgreSQL locally.

---

## Step 4: Update Sequelize CLI Configuration

### File: `config/config.js`

Change the Sequelize CLI configuration from MySQL to PostgreSQL.

### Before

```javascript
development: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_SERVER,
  dialect: "mysql",
},

production: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_SERVER,
  dialect: "mysql",
}
```

### After

```javascript
development: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_SERVER,
  dialect: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
},

production: {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_SERVER,
  dialect: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
}
```

The Sequelize CLI can then execute migrations against Neon:

```bash
npx sequelize-cli db:migrate
```

### Environment Variables

The existing environment variables are compatible with Neon:

```env
DB_SERVER=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Only the Sequelize dialect and SSL configuration need to change.

---

## Step 5: Fix Migration Timestamp Types

Two migration files use raw string `'TIMESTAMP'` definitions.

MySQL is more permissive with this usage, while PostgreSQL through Sequelize should use the Sequelize type definition.

### File

```text
migrations/20260707120000-add-sha-claims-table.js
```

### Before

```javascript
created_at: {
  type: 'TIMESTAMP'
},

updated_at: {
  type: 'TIMESTAMP'
}
```

### After

```javascript
created_at: {
  type: Sequelize.DATE
},

updated_at: {
  type: Sequelize.DATE
}
```

### Additional Migration

File:

```text
migrations/20260208091627-add-bed-management-table.js.js
```

Replace all occurrences of:

```javascript
type: 'TIMESTAMP'
```

with:

```javascript
type: Sequelize.DATE
```

---

## Step 6: Verify `updateOnDuplicate` and Upsert Compatibility

Sequelize translates:

```javascript
bulkCreate(data, {
  updateOnDuplicate: [...]
})
```

into PostgreSQL conflict-handling SQL using:

```sql
ON CONFLICT ... DO UPDATE
```

This requires a unique constraint or index on the conflict target columns.

### Existing `record_pk` Constraint

The models define:

```javascript
unique: true
```

on `record_pk`.

This provides the unique constraint required for conflict resolution.

However, this should still be verified against the actual Neon database schema.

### Files to Review

| File                                             |      Lines | `updateOnDuplicate` / Upsert |
| ------------------------------------------------ | ---------: | ---------------------------- |
| `services/visits_service.js`                     | 76, 83, 90 | `total`, `hie_facility_id`   |
| `services/waivers_service.js`                    |         29 | `waivers`, `hie_facility_id` |
| `services/ward_admissions_service.js`            |         35 | Multiple dataset fields      |
| `services/billing_service.js`                    |         50 | Billing fields               |
| `services/diagnosis_service.js`                  |         30 | `total`, `hie_facility_id`   |
| `services/immunization_service.js`               |         31 | `total`, `hie_facility_id`   |
| `services/inventory_service.js`                  |         49 | Inventory fields             |
| `services/mortality_service.js`                  |         30 | `total`, `hie_facility_id`   |
| `services/payments_service.js`                   |     64, 70 | Payment fields               |
| `services/sha_claims_service.js`                 |         50 | Claims fields                |
| `services/sha_enrollments_service.js`            |         33 | Enrollment fields            |
| `services/staff_count_service.js`                |         30 | Staff fields                 |
| `services/workload_department_service.js`        |         39 | Workload fields              |
| `services/wait_time_service.js`                  |         31 | Wait-time fields             |
| `services/logged_in_users_with_roles_service.js` |         31 | User/role fields             |
| `controllers/dataset_controller.js`              |         74 | `Version.upsert()`           |
| `routes/receiver.js`                             |    122–240 | Legacy `bulkCreate()`        |

### Action Required

Run the migrations against Neon Postgres and test the ingestion flow with sample payloads.

If PostgreSQL reports conflict-related errors, verify that:

```text
record_pk
```

uniquely identifies each row for the relevant dataset.

---

## Step 7: Model-Level Data Type Compatibility

No model files currently require changes.

The Sequelize types used across the models map cleanly to PostgreSQL and therefore Neon Postgres:

| Sequelize Type                        | Neon Postgres Type         | Notes                          |
| ------------------------------------- | -------------------------- | ------------------------------ |
| `Sequelize.INTEGER` + `autoIncrement` | `BIGSERIAL` / Identity     | Sequelize handles this         |
| `Sequelize.TEXT`                      | `TEXT`                     | Unlimited length               |
| `Sequelize.BIGINT`                    | `BIGINT`                   | Compatible                     |
| `Sequelize.DECIMAL(15, 2)`            | `DECIMAL(15, 2)`           | Compatible                     |
| `Sequelize.FLOAT`                     | `DOUBLE PRECISION`         | Compatible                     |
| `Sequelize.DATEONLY`                  | `DATE`                     | Compatible                     |
| `Sequelize.STRING`                    | `VARCHAR(255)`             | Compatible                     |
| `Sequelize.DATE`                      | `TIMESTAMP WITH TIME ZONE` | Timezone-aware                 |
| `paranoid: true`                      | `deleted_at`               | Soft deletes supported         |
| `underscored: true`                   | snake_case columns         | Supported                      |
| `freezeTableName: true`               | Fixed table names          | Supported                      |
| `unique: true`                        | Unique index               | Required for conflict handling |

No manual PostgreSQL schema conversion is required for these Sequelize model types.

---

## Step 8: Fix Broken Test Reference

### File

```text
models/sha_enrollment_test.js
```

The file currently contains:

```javascript
const sequelize = require("../db_config_test");
```

### Problem

The referenced file:

```text
db_config_test.js
```

does not exist.

This will cause the test file to fail when imported.

### Options

#### Option 1: Create a Test Database Configuration

Create a test configuration based on `db_config.js` that connects to an appropriate test database.

For example:

```text
db_config_test.js
```

The test configuration should use a dedicated database rather than modifying production data.

#### Option 2: Remove the Test File

If this test is no longer required, remove:

```text
models/sha_enrollment_test.js
```

---

## Step 9: Update Documentation

### File: `README.md`

Update existing MySQL references.

### Replace

```text
stores them in a MySQL database
```

with:

```text
stores them in a Neon Postgres database
```

Replace:

```text
Database: MySQL via Sequelize ORM
```

with:

```text
Database: Neon Postgres via Sequelize ORM
```

Update the prerequisites section to reference:

```text
Neon Postgres
```

instead of a generic/local MySQL or PostgreSQL installation.

Update environment descriptions:

```text
DB_SERVER | Neon Postgres host
DB_PORT   | Neon Postgres port
```

---

## Step 10: Docker & Deployment

### `docker-compose.yml`

The application should connect to the existing **Neon Postgres** database.

A PostgreSQL container is **not required** for this migration.

The application container can continue loading the Neon credentials through:

```yaml
env_file:
  - .env
```

The `.env` file should contain the Neon database connection details:

```env
DB_SERVER=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

### Do Not Add a Local PostgreSQL Container

Do not add:

```yaml
db:
  image: postgres:15
```

to `docker-compose.yml` for the Neon deployment architecture.

Doing so would create a separate local PostgreSQL database and could cause the application to connect to the wrong database.

The intended architecture is:

```text
Application
    │
    │ PostgreSQL / SSL
    ▼
Neon Postgres
```

### Dockerfile

No changes are required.

The existing Node.js base image is compatible with the `pg` driver.

### `docker/start.sh`

No changes are required.

The existing startup process:

```bash
npx sequelize-cli db:migrate
```

can run migrations against Neon Postgres before starting the application.

### `.github/workflows/deployment.yml`

No application changes are required if the deployment environment already provides the correct Neon environment variables.

---

# Step 11: Neon Postgres Considerations

## Connection Pooling

Neon has connection limits, so avoid the previous pool configuration of:

```javascript
pool: {
  max: 1000,
}
```

Use a more conservative configuration:

```javascript
pool: {
  max: 20,
  min: 0,
  idle: 10000,
  acquire: 60000,
}
```

The exact pool size should be adjusted based on the Neon plan and application workload.

---

## SSL

The Neon connection should use SSL:

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
}
```

SSL/TLS should be enabled when connecting to the Neon database.

---

## Scale-to-Zero

Neon can scale compute down during periods of inactivity.

If the application experiences connection delays after inactivity, consider implementing retry logic around database connection and query operations.

Do not treat an excessively long connection timeout as a substitute for proper retry handling.

---

## Database Branching

Neon supports database branching.

Branches can be used for isolated development, testing, or migration validation.

No Sequelize model changes are required to use Neon branches.

Each branch can provide its own database connection credentials.

---

## Environment Variables

The existing environment variable structure is compatible with Neon:

```env
DB_SERVER=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Alternatively, Neon provides a complete PostgreSQL connection string:

```text
postgresql://user:password@host/database
```

Use whichever approach is compatible with the application's existing configuration.

---

# Migration Checklist

|  # | Change                                            | File / Area                                     | Status |
| -: | ------------------------------------------------- | ----------------------------------------------- | :----: |
|  1 | Replace `mysql2` with `pg` + `pg-hstore`          | `package.json`                                  |    ☐   |
|  2 | Change Sequelize dialect to `postgres`            | `db_config.js`                                  |    ☐   |
|  3 | Add Neon SSL configuration                        | `db_config.js`                                  |    ☐   |
|  4 | Reduce database connection pool                   | `db_config.js`                                  |    ☐   |
|  5 | Change Sequelize CLI dialect to `postgres`        | `config/config.js`                              |    ☐   |
|  6 | Add Neon SSL configuration to CLI                 | `config/config.js`                              |    ☐   |
|  7 | Replace `type: 'TIMESTAMP'` with `Sequelize.DATE` | `20260707120000-add-sha-claims-table.js`        |    ☐   |
|  8 | Replace `type: 'TIMESTAMP'` with `Sequelize.DATE` | `20260208091627-add-bed-management-table.js.js` |    ☐   |
|  9 | Verify `record_pk` unique constraints             | Models / migrations                             |    ☐   |
| 10 | Fix or remove broken test reference               | `models/sha_enrollment_test.js`                 |    ☐   |
| 11 | Update documentation to reference Neon Postgres   | `README.md`                                     |    ☐   |
| 12 | Verify Neon environment variables                 | `.env` / deployment                             |    ☐   |
| 13 | Run migrations against Neon                       | Sequelize CLI                                   |    ☐   |
| 14 | Test data ingestion                               | `POST /api/v2/dataset`                          |    ☐   |
| 15 | Test data retrieval                               | `GET /spot/:fid`                                |    ☐   |

---

# Testing After Migration

## 1. Run Database Migrations

Run:

```bash
npx sequelize-cli db:migrate
```

The command should connect to the **Neon Postgres database** configured in the environment variables.

---

## 2. Test Data Ingestion

Example:

```bash
curl -X POST http://localhost:5000/api/v2/dataset \
  -H "Content-Type: application/json" \
  -d '{
    "mfl_code": "12345",
    "timestamp": "20250101000000",
    "dataset_type": "visits",
    "data": [...]
  }'
```

Verify that the payload is successfully persisted in Neon Postgres.

---

## 3. Test Data Retrieval

Example:

```bash
curl \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/spot/FID-001
```

Verify that the endpoint successfully retrieves data from Neon Postgres.

---

## 4. Check Application Logs

Check the application logs for:

* Database connection errors
* SSL/TLS errors
* Connection pool exhaustion
* PostgreSQL syntax errors
* Migration failures
* `ON CONFLICT` errors
* Data type mismatches
* Authentication failures

---

# Final Architecture

After the migration, the intended architecture is:

```text
┌─────────────────────────────────┐
│       KenyaEMR Visualization    │
│            Receiver             │
│                                 │
│       Node.js + Sequelize       │
└───────────────┬─────────────────┘
                │
                │ PostgreSQL
                │ SSL / TLS
                ▼
┌─────────────────────────────────┐
│          Neon Postgres          │
│                                 │
│       Managed PostgreSQL        │
│          Database               │
└─────────────────────────────────┘
```

The application connects directly to the **managed Neon Postgres database**.

There is no requirement for:

* A locally installed PostgreSQL server
* A PostgreSQL Docker container
* A local PostgreSQL database
* A separate database server

---

# Notes

* All models use `paranoid: true`, which adds a `deleted_at` column for soft deletes. Sequelize handles this with PostgreSQL.
* `Sequelize.INTEGER` with `autoIncrement: true` generates PostgreSQL-compatible auto-increment behavior such as `BIGSERIAL` or `GENERATED AS IDENTITY`.
* `routes/receiver.js` contains a duplicate data ingestion flow that uses the same Sequelize patterns as the service layer.
* No MySQL-specific database operations were identified in `routes/receiver.js` beyond standard Sequelize usage.
* `mfl_code` is defined as `INTEGER` in some models but as `STRING` in certain migrations. Verify this type alignment after migration if data integrity is important.
* The migration should be tested against the actual Neon database before production deployment.

---

# Migration Completion Criteria

The migration is complete when:

* [ ] `mysql2` has been removed.
* [ ] `pg` and `pg-hstore` have been installed.
* [ ] Sequelize uses the `postgres` dialect.
* [ ] Sequelize is configured for Neon SSL/TLS.
* [ ] The database environment variables point to Neon Postgres.
* [ ] Connection pooling has been configured appropriately.
* [ ] All affected migrations execute successfully against Neon.
* [ ] `record_pk` unique constraints have been verified.
* [ ] The broken test reference has been resolved.
* [ ] Documentation references Neon Postgres.
* [ ] No unnecessary local PostgreSQL database has been introduced.
* [ ] `npx sequelize-cli db:migrate` succeeds against Neon.
* [ ] `POST /api/v2/dataset` successfully ingests data.
* [ ] `GET /spot/:fid` successfully retrieves data.
* [ ] Application logs show no database connection or query errors.

---

## Result

The migration changes the database layer from:

```text
MySQL
  │
  ▼
mysql2
  │
  ▼
Sequelize
```

to:

```text
Neon Postgres
  │
  ▼
pg
  │
  ▼
Sequelize
```

The application continues using Sequelize as its ORM while **Neon Postgres becomes the managed database backend**.
