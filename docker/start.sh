#!/bin/bash
set -e

echo "Running new migrations..."
npx sequelize-cli db:migrate

echo "Starting receiver app..."
exec node index.js