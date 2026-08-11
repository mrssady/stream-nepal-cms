-- CreateTable
CREATE TABLE "EventTimeline" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timelineDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTimeline_eventId_idx" ON "EventTimeline"("eventId");

-- CreateIndex
CREATE INDEX "EventTimeline_timelineDate_idx" ON "EventTimeline"("timelineDate");

-- CreateIndex
CREATE INDEX "EventTimeline_isActive_idx" ON "EventTimeline"("isActive");

-- AddForeignKey
ALTER TABLE "EventTimeline" ADD CONSTRAINT "EventTimeline_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
