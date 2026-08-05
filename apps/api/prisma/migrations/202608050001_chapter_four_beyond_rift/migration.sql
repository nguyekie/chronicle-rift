INSERT INTO "CampaignChapter" ("id","number","name","description")
VALUES (
  'chapter_beyond_the_rift',4,'Vương Quốc Ngoài Khe Nứt',
  'Mười hai chiến trường siêu cấp với đột biến kép, quân đoàn xuyên thế giới và ba Boss Thần Vực.'
)
ON CONFLICT ("number") DO UPDATE SET
  "name"=EXCLUDED."name","description"=EXCLUDED."description";

WITH chapter AS (SELECT "id" FROM "CampaignChapter" WHERE "number"=4),
stages("number","name","kind","aiLevel","faction","strategy","mutation","gold","dust","phases") AS (
 VALUES
 (1,'Bến Cảng Ngược Dòng','NORMAL','BOSS','ARCANUM','TEMPO_REVERSAL','MANA_INVERSION',4200,520,NULL::jsonb),
 (2,'Vườn Sao Thất Lạc','NORMAL','BOSS','NEUTRAL','FATE_GARDEN','FATE_SURGE',4500,560,NULL::jsonb),
 (3,'Pháo Đài Một Trăm Khiên','NORMAL','BOSS','IRONVALE','FORTRESS_CHAIN','FORTIFIED_ROWS',4800,600,NULL::jsonb),
 (4,'Long Vương Bẻ Gãy Thiên Không','BOSS','BOSS','NEUTRAL','SKYTYRANT','ARCANE_ECLIPSE',6000,850,'[{"phase":1,"health":100,"passive":"Long Giáp"},{"phase":2,"health":65,"passive":"Bão Xé Trời"},{"phase":3,"health":30,"passive":"Thiên Không Sụp Đổ"}]'::jsonb),
 (5,'Thư Viện Không Có Ngày Mai','NORMAL','BOSS','ARCANUM','INFINITE_ARCHIVE','DOUBLE_FORESEE',5200,680,NULL::jsonb),
 (6,'Đấu Trường Hồi Sinh','NORMAL','BOSS','IRONVALE','REBIRTH_LEGION','FIRST_REBIRTH',5500,720,NULL::jsonb),
 (7,'Đồng Hồ Tận Diệt','NORMAL','BOSS','NEUTRAL','DOOM_CLOCK','TURN_COUNTDOWN',5800,760,NULL::jsonb),
 (8,'Nữ Hoàng Gương Vỡ','BOSS','BOSS','ARCANUM','MIRROR_QUEEN','MIRROR_CAST',7200,1050,'[{"phase":1,"health":100,"passive":"Phản Chiếu"},{"phase":2,"health":72,"passive":"Vạn Kính"},{"phase":3,"health":42,"passive":"Đảo Ngược Sinh Mệnh"},{"phase":4,"health":18,"passive":"Gương Vỡ Toàn Phần"}]'::jsonb),
 (9,'Con Đường Của Những Vị Thần','NORMAL','BOSS','NEUTRAL','ASCENDANT_MARCH','CELESTIAL_TAX',6500,900,NULL::jsonb),
 (10,'Biển Đen Không Đáy','NORMAL','BOSS','ARCANUM','ABYSS_CONTROL','VOID_TIDE',7000,980,NULL::jsonb),
 (11,'Cổng Cuối Cùng Của Thực Tại','NORMAL','BOSS','IRONVALE','LAST_GATE','SUDDEN_DEATH',7600,1100,NULL::jsonb),
 (12,'Đấng Kiến Tạo Vạn Giới','BOSS','BOSS','NEUTRAL','WORLD_ARCHITECT','REALITY_COLLAPSE',12000,2500,'[{"phase":1,"health":100,"passive":"Kiến Tạo"},{"phase":2,"health":80,"passive":"Viết Lại Luật"},{"phase":3,"health":58,"passive":"Xóa Bỏ Thời Gian"},{"phase":4,"health":35,"passive":"Vạn Giới Hợp Nhất"},{"phase":5,"health":12,"passive":"Phán Quyết Thực Tại"}]'::jsonb)
)
INSERT INTO "CampaignStage"(
 "id","chapterId","number","name","kind","aiLevel","enemyDeck","rewardGold","rewardDust","bossPhases"
)
SELECT
 'stage_beyond_rift_'||stages."number",chapter."id",stages."number",stages."name",
 stages."kind"::"StageKind",stages."aiLevel"::"AiLevel",
 jsonb_build_object(
  'faction',stages."faction",'strategy',stages."strategy",'mutation',stages."mutation",
  'deckSize',30,'powerTier',40+stages."number",'crossFaction',true,'eliteCurve',true
 ),stages."gold",stages."dust",stages."phases"
FROM stages CROSS JOIN chapter
ON CONFLICT("chapterId","number") DO UPDATE SET
 "name"=EXCLUDED."name","kind"=EXCLUDED."kind","aiLevel"=EXCLUDED."aiLevel",
 "enemyDeck"=EXCLUDED."enemyDeck","rewardGold"=EXCLUDED."rewardGold",
 "rewardDust"=EXCLUDED."rewardDust","bossPhases"=EXCLUDED."bossPhases";
