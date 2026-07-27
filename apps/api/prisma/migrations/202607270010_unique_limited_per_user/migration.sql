-- Keep the earliest-issued serial when an account currently owns duplicates.
WITH ranked_copies AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "cardId"
      ORDER BY "serial" ASC, "mintedAt" ASC, "id" ASC
    ) AS copy_rank
  FROM "LimitedCardCopy"
)
DELETE FROM "LimitedCardCopy" AS copy
USING ranked_copies AS ranked
WHERE copy."id" = ranked."id"
  AND ranked.copy_rank > 1;

-- Limited ownership and deck usage are both strictly one copy per card.
UPDATE "UserCard" AS owned
SET "quantity" = 1
FROM "Card" AS card
WHERE owned."cardId" = card."id"
  AND card."rarity" = 'LIMITED'
  AND owned."quantity" > 1;

UPDATE "DeckCard" AS deck_card
SET "quantity" = 1
FROM "Card" AS card
WHERE deck_card."cardId" = card."id"
  AND card."rarity" = 'LIMITED'
  AND deck_card."quantity" > 1;

CREATE UNIQUE INDEX "LimitedCardCopy_userId_cardId_key"
ON "LimitedCardCopy"("userId", "cardId");
