-- CreateTable
CREATE TABLE "OcrProfile" (
    "id" TEXT NOT NULL,
    "game" "TournamentGame" NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OcrProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OcrProfile_game_idx" ON "OcrProfile"("game");

-- CreateIndex
CREATE INDEX "OcrProfile_isDefault_idx" ON "OcrProfile"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "OcrProfile_game_name_key" ON "OcrProfile"("game", "name");
