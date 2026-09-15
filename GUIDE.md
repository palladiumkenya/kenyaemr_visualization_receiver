  # Guide: Migrating KenyaEMR Visualization Receiver from MySQL to Neon Postgres
        
  ## Overview

  This guide covers all required changes to switch the application's database from MySQL to Neon Postgres. The codebase uses Sequelize
  ORM, so most data-type abstractions port well — the main changes are the driver, dialect, and a few MySQL-specific syntax patterns.

  ---

  ## 1. Package Dependencies

  ### File: `package.json` (line 15)

  **Before:**
  ```json
  "mysql2": "^3.6.5",

  After:
  "pg": "^8.11.3",
  "pg-hstore": "^2.13.3",

  Run npm install or npm uninstall mysql2 && npm install pg pg-hstore afterward. Remove mysql2 to avoid dead dependency.

  ---

  2. Sequelize Instance Configuration

  File: db_config.js (lines 10-23)

  Before:
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
      idle: 900000
    },
    logging: false,
  });

  After:
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

  Key changes:
  - dialect: "postgres" — switches Sequilize to PG driver
  - Added ssl block under dialectOptions — Neon requires TLS/SSL
  - pool.max: 20 (down from 1000) — Neon has connection limits; 1000 connections will exhaust the pool
  - pool.idle: 10000 — Neon scales to zero aggressively; shorter idle timeout prevents stale connections

  ---

  3. Sequelize CLI Config

  File: config/config.js (lines 8, 15)

  Before:
  dialect: "mysql"

  After (both development and production):
  dialect: "postgres"

  Optional: Add dialectOptions with SSL for CLI-driven migrations:
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
      }
    }
  }

  ---

  4. Migration Fixes — Replace Raw 'TIMESTAMP' Strings

  File: migrations/20260707120000-add-sha-claims-table.js (lines 53, 56, 59)

  Before:
  created_at: {
    type: 'TIMESTAMP'
  },
  updated_at: {
    type: 'TIMESTAMP'
  }

  After:
  created_at: {
    type: Sequelize.DATE
  },
  updated_at: {
    type: Sequelize.DATE
  }

  File: migrations/20260208091627-add-bed-management-table.js.js (lines 61, 64, 67)

  Same pattern — replace all three type: 'TIMESTAMP' with type: Sequelize.DATE.

  ---

  5. updateOnDuplicate / upsert Compatibility (Code Review Required)

  What works automatically:

  Sequelize translates updateOnDuplicate → ON CONFLICT DO UPDATE for Postgres. This requires:
  - A unique constraint or index on the conflict target column
  - All models already define unique: true on record_pk — this satisfies the requirement

  Files to verify (already using record_pk unique constraint):

  - services/visits_service.js (lines 76, 83, 90)
  - services/waivers_service.js (line 29)
  - services/ward_admissions_service.js (line 35)
  - services/billing_service.js (line 50)
  - services/diagnosis_service.js (line 30)
  - services/immunization_service.js (line 31)
  - services/inventory_service.js (line 49)
  - services/mortality_service.js (line 30)
  - services/payments_service.js (line 64, 70)
  - services/sha_claims_service.js (line 50)
  - services/sha_enrollments_service.js (line 33)
  - services/staff_count_service.js (line 30)
  - services/workload_department_service.js (line 39)
  - services/wait_time_service.js (line 31)
  - services/logged_in_users_with_roles_service.js (line 31)
  - controllers/dataset_controller.js (line 74 — Version.upsert)
  - routes/receiver.js (lines 122-240 — legacy bulkCreate calls)

  No code changes needed here if the record_pk unique indexes are confirmed on all tables. Verify during migration testing.

  ---

  6. Model-Level Data Type Compatibility (No Changes Needed)

  All Sequelize types used in models map directly to Postgres:

  ┌───────────────────────────────────┬──────────────────────────┬──────────────────────────────────────────┐
  │          Sequelize Type           │   Postgres Equivalent    │                  Notes                   │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.INTEGER + autoIncrement │ SERIAL / BIGSERIAL       │ Automatic                                │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.TEXT                    │ TEXT (unlimited)         │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.BIGINT                  │ BIGINT                   │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.DECIMAL(15,2)           │ DECIMAL(15,2)            │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.FLOAT                   │ DOUBLE PRECISION         │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.DATEONLY                │ DATE                     │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.STRING                  │ VARCHAR(255)             │ Compatible                               │
  ├───────────────────────────────────┼──────────────────────────┼──────────────────────────────────────────┤
  │ Sequelize.DATE                    │ TIMESTAMP WITH TIME ZONE │ Sequelize uses timezone-aware timestamps │
  └───────────────────────────────────┴──────────────────────────┴──────────────────────────────────────────┘

  No model file changes required.

  ---

  7. Test File — Broken Reference

  File: models/sha_enrollment_test.js (line 1)

  References ../db_config_test which does not exist. Either:
  - Create a test config (e.g., db_config_test.js), or
  - Delete this file

  ---

  8. Documentation Updates

  File: README.md

  Update the following lines:
  - Line 3: "stores them in a MySQL database" → "stores them in a PostgreSQL database"
  - Line 8: "MySQL via Sequelize ORM" → "PostgreSQL via Sequelize ORM"
  - Line 17: "MySQL" → "PostgreSQL"
  - Line 36: "DB_SERVER | MySQL host" → "DB_SERVER | PostgreSQL host"
  - Line 37: "DB_PORT | MySQL port" → "DB_PORT | PostgreSQL port"

  ---

  9. Environment & Docker

  .env / .env.save

  No changes needed to variable structure. The existing .env.save already has Postgres-compatible values (DB_PORT=5432, DB_USER=postgres),
  but they were incorrectly applied to a MySQL-based codebase. Now they will work correctly.

  docker-compose.yml

  Currently has no database service (assumes external DB). If local Postgres is needed for development, add:

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

  docker/start.sh (no changes)

  Already runs npx sequelize-cli db:migrate — works unchanged with PG once config is updated.

  .github/workflows/deployment.yml (no changes)

  Deploys to an external environment with its own DB config. The .env is copied from server path — no code changes needed.

  ---

  10. Neon-Specific Recommendations

  1. Connection string: Use Neon's connection URI format (postgresql://user:pass@host/dbname) if preferred. The split env vars (DB_SERVER,
     DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) work as-is.
  2. Pooling: Keep pool.max at 20 or lower for Neon. Higher values may hit Neon's connection limits.
  3. SSL: The dialectOptions.ssl block is mandatory for Neon.
  4. Branching: Neon supports database branching. No code changes needed to use this feature.
  5. Scale-to-zero: Consider adding retry logic around database calls if the app experiences cold starts exceeding timeout thresholds. The
     current connectTimeout: 4000000 (very long) is fine for initial connection.
  6. Serverless driver: If migrating to @neondatabase/pg (serverless driver) instead of standard pg, you would need to configure Sequelize
     with a custom dialect module. The standard pg driver is recommended for Sequelize compatibility.

  ---

  Summary Checklist

  ┌─────┬────────────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┬───────┐
  │  #  │                   Action                   │                                 Files                                  │ Done? │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 1   │ Replace mysql2 with pg + pg-hstore         │ package.json                                                           │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 2   │ Change dialect to postgres                 │ db_config.js, config/config.js                                         │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 3   │ Add SSL + reduce pool for Neon             │ db_config.js                                                           │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 4   │ Fix 'TIMESTAMP' raw strings                │ 20260707120000-add-sha-claims-table.js,                                │ ☐     │
  │     │                                            │ 20260208091627-add-bed-management-table.js.js                          │       │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 5   │ Verify record_pk unique constraints for    │ All models, migrations                                                 │ ☐     │
  │     │ updateOnDuplicate                          │                                                                        │       │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 6   │ Fix or delete broken test reference        │ models/sha_enrollment_test.js                                          │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 7   │ Update documentation                       │ README.md                                                              │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 8   │ Update docker-compose.yml if local         │ docker-compose.yml                                                     │ ☐     │
  │     │ Postgres needed                            │                                                                        │       │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 9   │ Run npm install to install new driver      │ —                                                                      │ ☐     │
  ├─────┼────────────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┼───────┤
  │ 10  │ Test: npx sequelize-cli db:migrate against │ —                                                                      │ ☐     │
  │     │  Neon                                      │                                                                        │       │
  └─────┴────────────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┴───────┘

  ---

  Notes

  - The models use paranoid: true (soft deletes via deleted_at). PostgreSQL handles this natively through Sequelize.
  - Sequelize.BIGINT with autoIncrement: true works in Postgres — Sequelize generates BIGSERIAL (or GENERATED AS IDENTITY in newer PG
    versions).
  - The routes/receiver.js legacy endpoint is a duplicate of the /api/v2/dataset flow with the same Sequelize patterns — no MySQL-specific
    code found in it beyond the standard Sequelize calls.

  ---