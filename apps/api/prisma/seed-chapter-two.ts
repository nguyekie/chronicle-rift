import type { PrismaClient } from '@prisma/client';
import type { CardSeed } from '@chronicle/card-data';

const names = ['Cửa Ải Tro Xanh','Đường Hầm Trọng Lực','Thành Phố Không Bóng','Xưởng Máy Thức Tỉnh','Biển Gương Nghịch','Vườn Sao Tắt','Pháo Đài Song Sinh','Thư Khố Cấm','Đồng Hồ Đảo Chiều','Cầu Vồng Hư Không','Điện Bình Minh','Trí Tuệ Gương'];
const rarityRank = (rarity:string) => ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','ANCIENT','MYTHIC','CELESTIAL'].indexOf(rarity);

export async function seedChapterTwo(db:PrismaClient,cards:CardSeed[]) {
  const chapter = await db.campaignChapter.upsert({
    where:{number:2},
    update:{name:'Bình Minh Vỡ Trận',description:'Vượt vùng đất biến dạng và đối đầu Trí Tuệ Gương.'},
    create:{number:2,name:'Bình Minh Vỡ Trận',description:'Vượt vùng đất biến dạng và đối đầu Trí Tuệ Gương.'},
  });
  for (let number=1;number<=12;number++) {
    const faction = number%3===0?'NEUTRAL':number%2?'IRONVALE':'ARCANUM';
    const pool = cards.filter(card=>card.faction===faction&&card.rarity!=='LIMITED');
    const codes = [...pool]
      .sort((a,b)=>rarityRank(b.rarity)-rarityRank(a.rarity)||(b.attack??b.cost)-(a.attack??a.cost))
      .slice(0,15).flatMap(card=>[card.code,card.code]).slice(0,30);
    const data = {
      name:names[number-1]!, enemyDeck:{faction,codes},
      kind:number===12?'BOSS' as const:'NORMAL' as const,
      aiLevel:number<=2?'NORMAL' as const:number===12?'BOSS' as const:'HARD' as const,
      rewardGold:number===12?2500:450+number*45,
      rewardDust:number===12?500:number%3===0?80:30,
      bossPhases:number===12?[{phase:1,health:100,passive:'Mirror Learning'},{phase:2,health:55,passive:'Perfect Counter',attackBonus:4},{phase:3,health:25,passive:'Dawn Collapse',attackBonus:7}]:undefined,
    };
    await db.campaignStage.upsert({where:{chapterId_number:{chapterId:chapter.id,number}},update:data,create:{chapterId:chapter.id,number,...data}});
  }
}
