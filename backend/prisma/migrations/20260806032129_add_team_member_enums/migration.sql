-- CreateEnum
CREATE TYPE "Department" AS ENUM ('MANAGEMENT', 'ESPORTS', 'BROADCAST', 'PRODUCTION', 'MEDIA', 'MARKETING');

-- CreateEnum
CREATE TYPE "TeamPosition" AS ENUM ('OWNER', 'CO_OWNER', 'MANAGER', 'OBSERVER', 'CASTER', 'HOST', 'CAMERA_OPERATOR', 'GRAPHICS_OPERATOR', 'VIDEO_EDITOR', 'SOCIAL_MEDIA_MANAGER', 'TOURNAMENT_ADMIN', 'REFEREE');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "position" "TeamPosition" NOT NULL,
    "department" "Department" NOT NULL,
    "bio" TEXT,
    "profileImage" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "youtube" TEXT,
    "discord" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
