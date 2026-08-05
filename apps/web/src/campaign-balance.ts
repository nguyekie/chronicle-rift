import type {EngineCard} from '@chronicle/game-engine';

export type CampaignBoost={attack:number;health:number;spellDamage:number;label:string};

export function campaignBoost(chapter:number,stage:number,boss:boolean):CampaignBoost{
 if(chapter<3)return{attack:0,health:0,spellDamage:0,label:'Không cường hóa chỉ số'};
 const tier=1+Math.floor(Math.max(0,stage-1)/4)+Math.max(0,chapter-3)*2;
 const attack=tier+(boss?2:0),health=tier+(boss?3:0),spellDamage=tier+(boss?2:0);
 return{attack,health,spellDamage,label:`Cường hóa công khai: đơn vị +${attack} Công/+${health} Máu · phép +${spellDamage} sát thương`};
}

export function enhanceCampaignCard(card:EngineCard,chapter:number,stage:number,boss:boolean):EngineCard{
 const boost=campaignBoost(chapter,stage,boss);
 if(card.type==='UNIT')return{...card,attack:(card.attack??0)+boost.attack,health:(card.health??1)+boost.health};
 return{...card,damage:Math.max(1,card.damage??1)+boost.spellDamage};
}
