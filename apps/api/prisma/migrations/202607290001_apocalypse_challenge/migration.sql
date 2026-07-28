-- Chương hậu kỳ dành cho người chơi đã hoàn thành Chương 2.
INSERT INTO "CampaignChapter" ("id", "number", "name", "description")
VALUES (
  'chapter_apocalypse_challenge',
  3,
  'Thử Thách Tận Thế',
  'Đối đầu Thống Lĩnh Vạn Giới: AI tối thượng sử dụng những quân bài mới và mạnh nhất từ cả ba phe.'
)
ON CONFLICT ("number") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description";

INSERT INTO "CampaignStage" (
  "id", "chapterId", "number", "name", "kind", "aiLevel",
  "enemyDeck", "rewardGold", "rewardDust", "bossPhases"
)
VALUES (
  'stage_apocalypse_challenge_1',
  (SELECT "id" FROM "CampaignChapter" WHERE "number" = 3),
  1,
  'Ngai Vạn Giới',
  'BOSS',
  'BOSS',
  '{
    "faction":"NEUTRAL",
    "strategy":"ULTIMATE_CROSS_FACTION",
    "codes":[
      "IV-063","IV-064","AR-063","AR-064","NE-063","NE-064",
      "IV-061","AR-061","NE-061","IV-062","AR-062","NE-062",
      "IV-060","AR-060","NE-060"
    ]
  }'::jsonb,
  5000,
  1000,
  '[
    {"phase":1,"health":100,"passive":"Đọc Vận Mệnh"},
    {"phase":2,"health":65,"passive":"Phản Công Hoàn Hảo"},
    {"phase":3,"health":30,"passive":"Tận Thế Hội Tụ"}
  ]'::jsonb
)
ON CONFLICT ("chapterId", "number") DO UPDATE SET
  "name" = EXCLUDED."name",
  "kind" = EXCLUDED."kind",
  "aiLevel" = EXCLUDED."aiLevel",
  "enemyDeck" = EXCLUDED."enemyDeck",
  "rewardGold" = EXCLUDED."rewardGold",
  "rewardDust" = EXCLUDED."rewardDust",
  "bossPhases" = EXCLUDED."bossPhases";
