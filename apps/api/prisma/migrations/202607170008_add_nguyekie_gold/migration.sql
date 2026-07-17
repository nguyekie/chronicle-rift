INSERT INTO "UserCurrency" ("userId", "code", "balance")
SELECT "userId", 'GOLD'::"CurrencyCode", 1000000
FROM "UserProfile"
WHERE LOWER("displayName") = 'nguyekie'
ON CONFLICT ("userId", "code") DO UPDATE
SET "balance" = "UserCurrency"."balance" + 1000000;
