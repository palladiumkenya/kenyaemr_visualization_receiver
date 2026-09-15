# Guide: Migrating KenyaEMR Visualization Receiver from MySQL to Neon PostgreSQL

## Overview

This guide covers all required changes to switch the application's database from **MySQL to Neon PostgreSQL**.

The codebase uses **Sequelize ORM**, so most data-type abstractions port well. The main changes involve the database driver, dialect configuration, and a few MySQL-specific syntax patterns.

---

## 1. Package Dependencies

### File: `package.json`

### Before

```json
"mysql2": "^3.6.5"
```

### After

```json
"pg": "^8.11.3",
"pg-hstore": "^2.13.3"
```

Run:

```bash
npm uninstall mysql2
npm install pg pg-hstore
```

Remove `mysql2` to avoid leaving an unused dependency in the project.

---

## 2. Sequelize Instance Configuration

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

### Key Changes

* **`dialect: "postgres"`** — switches Sequelize to PostgreSQL.
* **SSL configuration added** — Neon requires TLS/SSL connections.
* **`pool.max: 20`** — reduced from `1000` because Neon has connection limits.
* **`pool.idle: 10000`** — shorter idle timeout helps prevent stale connections when Neon scales to zero.

---

## 3. Sequelize CLI Configuration

### File: `config/config.js`

Change the dialect in both development and production environments.

### Before

```javascript
dialect: "mysql"
```

### After

```javascript
dialect: "postgres"
```

For production, the configuration can include SSL:

```javascript
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

---

## 4. Migration Fixes — Replace Raw `TIMESTAMP` Strings

Some migrations use raw MySQL-style `TIMESTAMP` strings.

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

Apply the same change:

```javascript
type: 'TIMESTAMP'
```

→

```javascript
type: Sequelize.DATE
```

Replace all three occurrences.

---

## 5. `updateOnDuplicate` / Upsert Compatibility

### Code Review Required

Sequelize automatically translates:

```javascript
updateOnDuplicate
```

into PostgreSQL's:

```sql
ON CONFLICT DO UPDATE
```

However, this requires a **unique constraint or index** on the conflict target column.

The models already define:

```javascript
unique: true
```

on `record_pk`, which satisfies this requirement.

### Files to Verify

* `services/visits_service.js` — lines 76, 83, 90
* `services/waivers_service.js` — line 29
* `services/ward_admissions_service.js` — line 35
* `services/billing_service.js` — line 50
* `services/diagnosis_service.js` — line 30
* `services/immunization_service.js` — line 31
* `services/inventory_service.js` — line 49
* `services/mortality_service.js` — line 30
* `services/payments_service.js` — lines 64, 70
* `services/sha_claims_service.js` — line 50
* `services/sha_enrollments_service.js` — line 33
* `services/staff_count_service.js` — line 30
* `services/workload_department_service.js` — line 39
* `services/wait_time_service.js` — line 31
* `services/logged_in_users_with_roles_service.js` — line 31
* `controllers/dataset_controller.js` — line 74 (`Version.upsert`)
* `routes/receiver.js` — lines 122–240 (legacy `bulkCreate` calls)

### Required Action

No code changes should be necessary **if the `record_pk` unique indexes are confirmed on all relevant tables**.

Verify this during migration testing.

---

## 6. Model-Level Data Type Compatibility

No model changes are required.

The Sequelize types currently used map directly to PostgreSQL:

| Sequelize Type                        | PostgreSQL Equivalent      | Notes                                    |
| ------------------------------------- | -------------------------- | ---------------------------------------- |
| `Sequelize.INTEGER` + `autoIncrement` | `SERIAL` / `BIGSERIAL`     | Automatic                                |
| `Sequelize.TEXT`                      | `TEXT`                     | Unlimited                                |
| `Sequelize.BIGINT`                    | `BIGINT`                   | Compatible                               |
| `Sequelize.DECIMAL(15,2)`             | `DECIMAL(15,2)`            | Compatible                               |
| `Sequelize.FLOAT`                     | `DOUBLE PRECISION`         | Compatible                               |
| `Sequelize.DATEONLY`                  | `DATE`                     | Compatible                               |
| `Sequelize.STRING`                    | `VARCHAR(255)`             | Compatible                               |
| `Sequelize.DATE`                      | `TIMESTAMP WITH TIME ZONE` | Sequelize uses timezone-aware timestamps |

**No model file changes are required.**

---

## 7. Test File — Broken Reference

### File

```text
models/sha_enrollment_test.js
```

The file references:

```text
../db_config_test
```

which does not exist.

Choose one of the following:

### Option 1 — Create the test configuration

Create:

```text
db_config_test.js
```

### Option 2 — Remove the test file

Delete:

```text
models/sha_enrollment_test.js
```

---

## 8. Documentation Updates

### File: `README.md`

Update the following references:

| Current                           | Replace With                           |
| --------------------------------- | -------------------------------------- |
| `stores them in a MySQL database` | `stores them in a PostgreSQL database` |
| `MySQL via Sequelize ORM`         | `PostgreSQL via Sequelize ORM`         |
| `MySQL`                           | `PostgreSQL`                           |
| `DB_SERVER \| MySQL host`         | `DB_SERVER \| PostgreSQL host`         |
| `DB_PORT \| MySQL port`           | `DB_PORT \| PostgreSQL port`           |

---

## 9. Environment & Docker

### `.env` / `.env.save`

No changes are required to the existing environment variable structure.

The existing `.env.save` already contains PostgreSQL-compatible values such as:

```env
DB_PORT=5432
DB_USER=postgres
```

These values were previously being applied to a MySQL-based codebase. After switching Sequelize to PostgreSQL, they will work correctly.

---

### `docker-compose.yml`

The current configuration does not include a database service and assumes an external database.

If a local PostgreSQL database is required for development, add:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### `docker/start.sh`

No changes required.

The script already runs:

```bash
npx sequelize-cli db:migrate
```

This will continue to work with PostgreSQL once the Sequelize configuration is updated.

### `.github/workflows/deployment.yml`

No changes required.

The deployment uses an external environment with its own database configuration. The `.env` file is copied from the server path, so no code changes are necessary.

---

## 10. Neon-Specific Recommendations

### 1. Connection String

Neon supports the standard PostgreSQL connection URI:

```text
postgresql://user:password@host/dbname
```

The existing split environment variables also work:

```env
DB_SERVER=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

### 2. Connection Pooling

Keep:

```javascript
pool: {
  max: 20,
}
```

or lower.

Higher values may exceed Neon's connection limits.

### 3. SSL

The PostgreSQL configuration should include:

```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
}
```

### 4. Database Branching

Neon supports database branching.

No application code changes are required to take advantage of this feature.

### 5. Scale-to-Zero

Consider adding retry logic around database calls if the application experiences cold-start delays that exceed the configured timeout thresholds.

The current:

```javascript
connectTimeout: 4000000
```

is sufficient for the initial connection.

### 6. Serverless Driver

If migrating from the standard `pg` driver to:

```text
@neondatabase/pg
```

additional configuration will be required because Sequelize needs a custom dialect module.

For Sequelize compatibility, the standard `pg` driver is recommended.

---

# Summary Checklist

|  # | Action                                                        | Files                              | Done |
| -: | ------------------------------------------------------------- | ---------------------------------- | :--: |
|  1 | Replace `mysql2` with `pg` + `pg-hstore`                      | `package.json`                     |   ☐  |
|  2 | Change dialect to `postgres`                                  | `db_config.js`, `config/config.js` |   ☐  |
|  3 | Add SSL and reduce connection pool for Neon                   | `db_config.js`                     |   ☐  |
|  4 | Fix raw `TIMESTAMP` strings                                   | Migration files                    |   ☐  |
|  5 | Verify `record_pk` unique constraints for `updateOnDuplicate` | Models, migrations                 |   ☐  |
|  6 | Fix or delete broken test reference                           | `models/sha_enrollment_test.js`    |   ☐  |
|  7 | Update documentation                                          | `README.md`                        |   ☐  |
|  8 | Add PostgreSQL service if required locally                    | `docker-compose.yml`               |   ☐  |
|  9 | Install the new PostgreSQL driver                             | —                                  |   ☐  |
| 10 | Run migrations against Neon                                   | —                                  |   ☐  |

---

# Notes

* The models use `paranoid: true` for soft deletes through `deleted_at`. PostgreSQL handles this through Sequelize.
* `Sequelize.BIGINT` with `autoIncrement: true` works with PostgreSQL. Sequelize generates `BIGSERIAL` or `GENERATED AS IDENTITY` depending on the PostgreSQL/Sequelize configuration.
* The legacy `routes/receiver.js` endpoint duplicates the `/api/v2/dataset` flow and uses the same Sequelize patterns.
* No additional MySQL-specific code was identified in `routes/receiver.js` beyond the standard Sequelize calls.

---

## Migration Completion Criteria

The migration should be considered complete only after:

1. `mysql2` has been removed.
2. `pg` and `pg-hstore` are installed.
3. Sequelize uses the `postgres` dialect.
4. Neon SSL is enabled.
5. Connection pooling is configured appropriately.
6. All affected migrations run successfully.
7. `record_pk` unique constraints have been verified.
8. The broken test reference has been resolved.
9. Documentation references PostgreSQL instead of MySQL.
10. `npx sequelize-cli db:migrate` succeeds against the Neon database.
11. The application successfully reads from and writes to Neon PostgreSQL.
