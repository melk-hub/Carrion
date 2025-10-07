-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPLIED', 'PENDING', 'INTERVIEW_SCHEDULED', 'TECHNICAL_TEST', 'AWAITING_DECISION', 'OFFER_RECEIVED', 'NEGOTIATION', 'OFFER_ACCEPTED', 'REJECTED_BY_COMPANY', 'OFFER_DECLINED', 'APPLICATION_WITHDRAWN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'MANAGER', 'DEV', 'VISITOR');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('APPLICATIONS', 'INTERVIEWS', 'SUCCESS', 'STREAK', 'PROFILE', 'INTERACTION', 'MILESTONE', 'SEASONAL');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('COUNT', 'STREAK', 'PERCENTAGE', 'TIME_BASED', 'SPECIAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POSITIVE', 'NEGATIVE', 'WARNING', 'INFO', 'DEFAULT');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "hasProfile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'VISITOR',
    "hashedRefreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" UUID NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" DATE,
    "school" TEXT,
    "city" TEXT,
    "phoneNumber" TEXT,
    "personalDescription" TEXT,
    "portfolioLink" TEXT,
    "linkedin" TEXT,
    "goal" TEXT,
    "contractSought" TEXT[],
    "locationSought" TEXT[],
    "sector" TEXT[],
    "resume" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "tokenTimeValidity" TIMESTAMP(3) NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titleKey" TEXT,
    "messageKey" TEXT,
    "variables" JSONB,
    "language" TEXT DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobApply" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "salary" INTEGER,
    "userId" UUID NOT NULL,
    "status" "Status" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractType" TEXT,
    "interviewDate" TIMESTAMP(3),

    CONSTRAINT "jobApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivedJobApply" (
    "id" UUID NOT NULL,
    "originalId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "salary" INTEGER,
    "status" "Status" NOT NULL,
    "imageUrl" TEXT,
    "contractType" TEXT,
    "interviewDate" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "ArchivedJobApply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "document" TEXT[],
    "imageUrl" TEXT,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 10,
    "monthlyGoal" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrionAchievement" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "type" "AchievementType" NOT NULL,
    "threshold" INTEGER,
    "condition" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarrionAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "achievementId" UUID NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER DEFAULT 0,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_hashedRefreshToken_key" ON "User"("hashedRefreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_name_providerId_key" ON "Token"("name", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobApply" ADD CONSTRAINT "jobApply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedJobApply" ADD CONSTRAINT "ArchivedJobApply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "CarrionAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
