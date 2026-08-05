WITH target_set AS (
  SELECT "id" FROM "CardSet" ORDER BY "code" LIMIT 1
), living("code","name","description","type","faction","rarity","cost","attack","health","keywords") AS (
  VALUES
  ('IV-068','Long Kỵ Sĩ Thiên Uyên','Khiên chắn · Xung kích. Triệu hồi: gây 7 sát thương lên đơn vị yếu nhất của địch. Hạ gục: hoàn lại 2 Năng lượng và nhận +2 Công/+2 Máu.','UNIT'::"CardType",'IRONVALE'::"Faction",'MYTHIC'::"Rarity",9,18,22,'["Shield","Rush"]'::jsonb),
  ('AR-068','Nữ Hoàng Tinh Vân Seraphine','Hộ vệ · Tiên kiến · Cộng hưởng. Triệu hồi: rút 2 lá và nhận 4 Năng lượng. Cuối lượt: nếu đã dùng phép, nhận +3 Công/+3 Máu.','UNIT'::"CardType",'ARCANUM'::"Faction",'CELESTIAL'::"Rarity",10,15,20,'["Ward","Foresee","Resonance"]'::jsonb),
  ('NE-068','Cự Thần Lò Sao','Khiêu khích · Khiên chắn. Triệu hồi: toàn bộ đồng minh nhận +3 Công/+5 Máu và Khiên chắn; thủ lĩnh hồi 5 Máu.','UNIT'::"CardType",'NEUTRAL'::"Faction",'ANCIENT'::"Rarity",10,20,26,'["Taunt","Shield"]'::jsonb)
)
INSERT INTO "Card" ("id","code","name","description","type","faction","rarity","cost","attack","health","keywords","collectible","setId")
SELECT 'living_'||lower(replace(living."code",'-','_')),living."code",living."name",living."description",living."type",living."faction",living."rarity",living."cost",living."attack",living."health",living."keywords",true,target_set."id"
FROM living CROSS JOIN target_set
ON CONFLICT ("code") DO UPDATE SET
 "name"=EXCLUDED."name","description"=EXCLUDED."description","type"=EXCLUDED."type",
 "faction"=EXCLUDED."faction","rarity"=EXCLUDED."rarity","cost"=EXCLUDED."cost",
 "attack"=EXCLUDED."attack","health"=EXCLUDED."health","keywords"=EXCLUDED."keywords","collectible"=true;
