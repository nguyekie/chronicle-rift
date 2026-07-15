ALTER TYPE "Rarity" ADD VALUE IF NOT EXISTS 'LIMITED';
ALTER TABLE "Card" ADD COLUMN "printLimit" INTEGER;
ALTER TABLE "Card" ADD COLUMN "mintedCount" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "LimitedCardCopy" (
  "id" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "serial" INTEGER NOT NULL,
  "mintedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LimitedCardCopy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LimitedCardCopy_cardId_serial_key" ON "LimitedCardCopy"("cardId", "serial");
CREATE INDEX "LimitedCardCopy_userId_cardId_idx" ON "LimitedCardCopy"("userId", "cardId");
ALTER TABLE "LimitedCardCopy" ADD CONSTRAINT "LimitedCardCopy_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LimitedCardCopy" ADD CONSTRAINT "LimitedCardCopy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
