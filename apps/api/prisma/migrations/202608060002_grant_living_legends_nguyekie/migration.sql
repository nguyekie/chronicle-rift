-- Cấp một bản của mỗi Living Legend cho tài khoản nguyekie.
-- Idempotent: nếu đã sở hữu, chỉ bảo đảm số lượng tối thiểu là một.
INSERT INTO "UserCard" ("userId", "cardId", "quantity")
SELECT profile."userId", card."id", 1
FROM "UserProfile" AS profile
CROSS JOIN "Card" AS card
WHERE LOWER(profile."displayName") = LOWER('nguyekie')
  AND card."code" IN ('IV-068', 'AR-068', 'NE-068')
ON CONFLICT ("userId", "cardId")
DO UPDATE SET "quantity" = GREATEST("UserCard"."quantity", 1);
