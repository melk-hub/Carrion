#!/bin/sh
# Utilisation de /bin/sh car on est sur Alpine Linux souvent

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting application in production mode..."
npm run start:prod