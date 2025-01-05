/*
  Warnings:

  - You are about to drop the column `emailGoogle` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailMicrosoft` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'EDITOR');

-- DropIndex
DROP INDEX "User_emailGoogle_key";

-- DropIndex
DROP INDEX "User_emailMicrosoft_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailGoogle",
DROP COLUMN "emailMicrosoft",
DROP COLUMN "picture",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "tokenId" INTEGER,
ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_tokenId_key" ON "User"("tokenId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;
