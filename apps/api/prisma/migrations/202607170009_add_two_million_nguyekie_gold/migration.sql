INSERT INTO "UserCurrency" ("userId", "code", "balance")
SELECT "userId", 'GOLD'::"CurrencyCode", 2000000
FROM "UserProfile"
WHERE LOWER("displayName") = 'nguyekie'
ON CONFLICT ("userId", "code") DO UPDATE
SET "balance" = "UserCurrency"."balance" + 2000000;
