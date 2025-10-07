/*
  Warnings:

  - You are about to drop the column `userEmail` on the `Token` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "userEmail";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "imageUrl";
