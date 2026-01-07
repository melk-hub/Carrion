#!/bin/sh

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting application in production mode..."
npm run start:prod