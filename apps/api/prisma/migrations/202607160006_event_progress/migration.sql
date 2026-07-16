CREATE TABLE "UserEventStage" (
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "eventId" TEXT NOT NULL REFERENCES "GameEvent"("id") ON DELETE CASCADE,
  "stage" INTEGER NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("userId", "eventId", "stage")
);
CREATE INDEX "UserEventStage_eventId_stage_idx" ON "UserEventStage"("eventId", "stage");
