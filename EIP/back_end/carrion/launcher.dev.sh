#!/bin/sh

echo "Applying database migrations..."
npx prisma migrate dev

echo "Starting application in development mode..."
npm run start:dev