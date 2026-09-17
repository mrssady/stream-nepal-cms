-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchEventKind" ADD VALUE 'ZONE_STARTED';
ALTER TYPE "MatchEventKind" ADD VALUE 'ZONE_TIMER';

-- AlterTable
ALTER TABLE "ScoringRule" ADD COLUMN     "zoneCount" INTEGER NOT NULL DEFAULT 8;
