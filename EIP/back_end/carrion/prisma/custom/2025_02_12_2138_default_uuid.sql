CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE "jobApply"
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "User"
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "Token"
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "Settings"
  ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

