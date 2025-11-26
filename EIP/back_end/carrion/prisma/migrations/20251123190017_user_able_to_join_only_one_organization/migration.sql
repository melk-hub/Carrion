/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_userId_key" ON "OrganizationMember"("userId");
