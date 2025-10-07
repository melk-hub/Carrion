/*
  Warnings:

  - The values [AWAITING_DECISION] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('APPLIED', 'PENDING', 'INTERVIEW_SCHEDULED', 'TECHNICAL_TEST', 'OFFER_RECEIVED', 'NEGOTIATION', 'OFFER_ACCEPTED', 'REJECTED_BY_COMPANY', 'OFFER_DECLINED', 'APPLICATION_WITHDRAWN');
ALTER TABLE "jobApply" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "ArchivedJobApply" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
COMMIT;
