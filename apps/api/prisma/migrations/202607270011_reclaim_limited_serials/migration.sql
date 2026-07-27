-- Return serials removed by the one-copy-per-account cleanup to the live pool.
UPDATE "Card" AS card
SET "mintedCount" = copies.active_count
FROM (
  SELECT card."id" AS card_id, COUNT(copy."id")::INTEGER AS active_count
  FROM "Card" AS card
  LEFT JOIN "LimitedCardCopy" AS copy ON copy."cardId" = card."id"
  WHERE card."rarity" = 'LIMITED'
  GROUP BY card."id"
) AS copies
WHERE card."id" = copies.card_id;

-- Always reuse the lowest vacant serial without altering surviving copies.
CREATE OR REPLACE FUNCTION assign_vacant_limited_serial()
RETURNS TRIGGER AS $$
DECLARE
  available_serial INTEGER;
  card_limit INTEGER;
BEGIN
  SELECT "printLimit" INTO card_limit FROM "Card" WHERE "id" = NEW."cardId";
  SELECT candidate INTO available_serial
  FROM generate_series(1, card_limit) AS candidate
  WHERE NOT EXISTS (
    SELECT 1 FROM "LimitedCardCopy"
    WHERE "cardId" = NEW."cardId" AND "serial" = candidate
  )
  ORDER BY candidate
  LIMIT 1;
  IF available_serial IS NULL THEN RAISE EXCEPTION 'LIMITED_SOLD_OUT'; END IF;
  NEW."serial" := available_serial;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS limited_copy_assign_vacant_serial ON "LimitedCardCopy";
CREATE TRIGGER limited_copy_assign_vacant_serial
BEFORE INSERT ON "LimitedCardCopy"
FOR EACH ROW EXECUTE FUNCTION assign_vacant_limited_serial();
