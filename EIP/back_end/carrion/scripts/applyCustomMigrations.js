import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function applyCustomMigrations() {
  const customMigrationsDir = path.join(process.cwd(), 'prisma/custom');

  if (!fs.existsSync(customMigrationsDir)) {
    console.error(`Le dossier ${customMigrationsDir} n'existe pas.`);
    process.exit(1);
  }

  const files = fs.readdirSync(customMigrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sqlFilePath = path.join(customMigrationsDir, file);
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

      const queries = sqlContent
        .split(';')
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      console.log(`Applying ${file}...`);

      for (const query of queries) {
        console.log(`Executing: ${query}`);
        await prisma.$executeRawUnsafe(query);
      }
    }
  }
}

applyCustomMigrations()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
