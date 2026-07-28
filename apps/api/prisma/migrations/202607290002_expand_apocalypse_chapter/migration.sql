UPDATE "CampaignChapter"
SET
  "name" = 'Thử Thách Tận Thế',
  "description" = 'Mười hai chiến trường hậu kỳ với AI cấp cao, Boss thích nghi và những bộ bài mạnh nhất từ cả ba phe.'
WHERE "number" = 3;

WITH chapter AS (
  SELECT "id" FROM "CampaignChapter" WHERE "number" = 3
),
stages("number","name","kind","aiLevel","faction","strategy","gold","dust","bossPhases") AS (
  VALUES
    (2, 'Tàn Tích Ngôi Sao',       'NORMAL', 'NORMAL', 'ARCANUM',  'ARCANE_CONTROL',       1800, 180, NULL::jsonb),
    (3, 'Lò Rèn Hắc Nhật',         'NORMAL', 'BOSS',   'IRONVALE', 'TEMPO_FORGE',          2100, 220, NULL::jsonb),
    (4, 'Kẻ Nuốt Ánh Bình Minh',   'BOSS',   'BOSS',   'NEUTRAL',  'FATE_DEVOURER',        2800, 350, '[{"phase":1,"health":100,"passive":"Nuốt Ánh Sáng"},{"phase":2,"health":50,"passive":"Phản Phệ Vận Mệnh"}]'::jsonb),
    (5, 'Mê Cung Gương Máu',       'NORMAL', 'BOSS',   'ARCANUM',  'MIRROR_CONTROL',       2400, 260, NULL::jsonb),
    (6, 'Thành Trì Không Ngủ',     'NORMAL', 'BOSS',   'IRONVALE', 'ENDLESS_DEFENSE',      2600, 300, NULL::jsonb),
    (7, 'Biển Xúc Xắc Hỗn Mang',   'NORMAL', 'BOSS',   'NEUTRAL',  'FATE_CASCADE',         2800, 340, NULL::jsonb),
    (8, 'Đại Pháp Sư Tận Thế',     'BOSS',   'BOSS',   'ARCANUM',  'GRAND_SPELL_ENGINE',   3600, 500, '[{"phase":1,"health":100,"passive":"Kho Phép Vô Tận"},{"phase":2,"health":60,"passive":"Bão Bí Thuật"},{"phase":3,"health":25,"passive":"Đại Phép Tận Thế"}]'::jsonb),
    (9, 'Đoàn Quân Vạn Giới',      'NORMAL', 'BOSS',   'IRONVALE', 'CROSS_FACTION_ARMY',   3200, 420, NULL::jsonb),
    (10,'Hố Đen Nuốt Ký Ức',      'NORMAL', 'BOSS',   'NEUTRAL',  'VOID_EXECUTION',       3500, 480, NULL::jsonb),
    (11,'Cánh Cổng Phán Quyết',    'NORMAL', 'BOSS',   'ARCANUM',  'PERFECT_COUNTER',      4000, 600, NULL::jsonb),
    (12,'Thần Vương Khe Nứt',      'BOSS',   'BOSS',   'NEUTRAL',  'APOCALYPSE_ASCENDANT', 8000, 1500,'[{"phase":1,"health":100,"passive":"Thần Nhãn Toàn Tri"},{"phase":2,"health":70,"passive":"Vạn Quân Quy Phục"},{"phase":3,"health":40,"passive":"Khe Nứt Diệt Thế"},{"phase":4,"health":15,"passive":"Phán Quyết Cuối Cùng"}]'::jsonb)
)
INSERT INTO "CampaignStage" (
  "id","chapterId","number","name","kind","aiLevel","enemyDeck",
  "rewardGold","rewardDust","bossPhases"
)
SELECT
  'stage_apocalypse_challenge_' || stages."number",
  chapter."id",
  stages."number",
  stages."name",
  stages."kind"::"StageKind",
  stages."aiLevel"::"AiLevel",
  jsonb_build_object(
    'faction', stages."faction",
    'strategy', stages."strategy",
    'deckSize', 30,
    'powerTier', stages."number" + 20,
    'crossFaction', stages."aiLevel" = 'BOSS'
  ),
  stages."gold",
  stages."dust",
  stages."bossPhases"
FROM stages CROSS JOIN chapter
ON CONFLICT ("chapterId","number") DO UPDATE SET
  "name" = EXCLUDED."name",
  "kind" = EXCLUDED."kind",
  "aiLevel" = EXCLUDED."aiLevel",
  "enemyDeck" = EXCLUDED."enemyDeck",
  "rewardGold" = EXCLUDED."rewardGold",
  "rewardDust" = EXCLUDED."rewardDust",
  "bossPhases" = EXCLUDED."bossPhases";
