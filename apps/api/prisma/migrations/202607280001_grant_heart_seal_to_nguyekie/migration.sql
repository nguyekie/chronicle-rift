-- Cấp đúng một bản Tâm Ấn Khải Huyền cho nhân vật nguyekie.
-- ON CONFLICT giúp migration an toàn khi chạy lại hoặc người chơi đã sở hữu lá này.
INSERT INTO "UserCard" ("userId", "cardId", "quantity")
SELECT profile."userId", card."id", 1
FROM "UserProfile" AS profile
JOIN "Card" AS card ON card."code" = 'NE-067'
WHERE LOWER(profile."displayName") = LOWER('nguyekie')
ON CONFLICT ("userId", "cardId")
DO UPDATE SET "quantity" = GREATEST("UserCard"."quantity", 1);
