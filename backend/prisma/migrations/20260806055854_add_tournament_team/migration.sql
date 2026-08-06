-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'ELIMINATED', 'DISQUALIFIED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamLogo" TEXT,
    "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_registrationId_key" ON "Team"("registrationId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
