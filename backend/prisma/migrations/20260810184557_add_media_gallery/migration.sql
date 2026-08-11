-- CreateEnum
CREATE TYPE "MediaPlatform" AS ENUM ('FACEBOOK', 'YOUTUBE', 'IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" "MediaPlatform" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_organizationId_idx" ON "Media"("organizationId");

-- CreateIndex
CREATE INDEX "Media_platform_idx" ON "Media"("platform");

-- CreateIndex
CREATE INDEX "Media_category_idx" ON "Media"("category");

-- CreateIndex
CREATE INDEX "Media_isActive_idx" ON "Media"("isActive");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
