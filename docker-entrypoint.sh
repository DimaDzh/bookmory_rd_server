#!/bin/sh

# Wait for database to be ready
echo "Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is up - executing migrations"
npx prisma migrate deploy

echo "Starting application"
exec "$@"
