/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "imageUrl" TEXT;
