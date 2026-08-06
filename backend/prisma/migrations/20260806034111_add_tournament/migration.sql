-- CreateEnum
CREATE TYPE "TournamentGame" AS ENUM ('PUBG_MOBILE', 'FREE_FIRE', 'VALORANT', 'CS2', 'DOTA2', 'EA_FC', 'EFOOTBALL', 'MOBILE_LEGENDS', 'OTHER');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "game" "TournamentGame" NOT NULL,
    "logo" TEXT,
    "banner" TEXT,
    "description" TEXT,
    "rules" TEXT,
    "organizer" TEXT NOT NULL,
    "registrationFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prizePool" TEXT,
    "maxTeams" INTEGER NOT NULL,
    "currentTeams" INTEGER NOT NULL DEFAULT 0,
    "registrationOpen" TIMESTAMP(3) NOT NULL,
    "registrationClose" TIMESTAMP(3) NOT NULL,
    "tournamentStart" TIMESTAMP(3) NOT NULL,
    "tournamentEnd" TIMESTAMP(3) NOT NULL,
    "discordUrl" TEXT,
    "whatsappUrl" TEXT,
    "streamUrl" TEXT,
    "websiteUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");
