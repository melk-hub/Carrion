-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ON', 'OFF');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "emailGoogle" TEXT,
    "emailMicrosoft" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT,
    "picture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "TokenTimeValidity" TEXT NOT NULL,
    "RefreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobApply" (
    "id" SERIAL NOT NULL,
    "Company" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Salary" TEXT NOT NULL,
    "UserId" INTEGER,

    CONSTRAINT "jobApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "UserId" INTEGER,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailGoogle_key" ON "User"("emailGoogle");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailMicrosoft_key" ON "User"("emailMicrosoft");

-- CreateIndex
CREATE UNIQUE INDEX "jobApply_UserId_key" ON "jobApply"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_UserId_key" ON "Settings"("UserId");

-- AddForeignKey
ALTER TABLE "jobApply" ADD CONSTRAINT "jobApply_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
