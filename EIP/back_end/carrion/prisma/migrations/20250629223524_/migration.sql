/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Settings` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "imageUrl" TEXT;
