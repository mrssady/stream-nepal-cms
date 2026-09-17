-- CreateEnum
CREATE TYPE "LiveMatchStatus" AS ENUM ('SCHEDULED', 'READY', 'LIVE', 'PAUSED', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchEventSource" AS ENUM ('MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MatchEventKind" AS ENUM ('MATCH_STARTED', 'MATCH_READY', 'MATCH_PAUSED', 'MATCH_RESUMED', 'MATCH_FINISHED', 'MATCH_CANCELLED', 'PLAYER_KILLED', 'PLAYER_ELIMINATED', 'TEAM_ELIMINATED', 'PLACEMENT_CONFIRMED', 'PLACEMENT_SET', 'WINNER_DECLARED', 'MANUAL_CORRECTION', 'UNDO', 'MATCH_LOCKED', 'MATCH_REOPENED');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "slotNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "slotNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "scoringRuleId" TEXT;

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "game" "TournamentGame" NOT NULL,
    "killPoint" INTEGER NOT NULL DEFAULT 1,
    "placementPoints" JSONB NOT NULL,
    "booyahBonus" INTEGER NOT NULL DEFAULT 0,
    "penaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "tiebreakers" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveMatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "round" TEXT,
    "status" "LiveMatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "eventSeq" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "kind" "MatchEventKind" NOT NULL,
    "source" "MatchEventSource" NOT NULL DEFAULT 'MANUAL',
    "confidence" DOUBLE PRECISION,
    "payload" JSONB NOT NULL,
    "fingerprint" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoringRule_organizationId_idx" ON "ScoringRule"("organizationId");

-- CreateIndex
CREATE INDEX "ScoringRule_game_idx" ON "ScoringRule"("game");

-- CreateIndex
CREATE INDEX "ScoringRule_isDefault_idx" ON "ScoringRule"("isDefault");

-- CreateIndex
CREATE INDEX "LiveMatch_tournamentId_idx" ON "LiveMatch"("tournamentId");

-- CreateIndex
CREATE INDEX "LiveMatch_status_idx" ON "LiveMatch"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LiveMatch_tournamentId_matchNumber_key" ON "LiveMatch"("tournamentId", "matchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MatchEvent_fingerprint_key" ON "MatchEvent"("fingerprint");

-- CreateIndex
CREATE INDEX "MatchEvent_matchId_seq_idx" ON "MatchEvent"("matchId", "seq");

-- CreateIndex
CREATE INDEX "MatchEvent_fingerprint_idx" ON "MatchEvent"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "MatchEvent_matchId_seq_key" ON "MatchEvent"("matchId", "seq");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_scoringRuleId_fkey" FOREIGN KEY ("scoringRuleId") REFERENCES "ScoringRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringRule" ADD CONSTRAINT "ScoringRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveMatch" ADD CONSTRAINT "LiveMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "LiveMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
