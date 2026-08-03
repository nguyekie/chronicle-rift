import{describe,expect,it}from'vitest';
import{campaignBoost,enhanceCampaignCard}from'./campaign-balance';

describe('campaign chapter three balance',()=>{
 it('does not boost older chapters',()=>expect(campaignBoost(2,12,true).attack).toBe(0));
 it('makes later maps stronger than early maps',()=>expect(campaignBoost(3,12,false).attack).toBeGreaterThan(campaignBoost(3,2,false).attack));
 it('gives bosses a stronger public modifier',()=>expect(campaignBoost(3,8,true).health).toBeGreaterThan(campaignBoost(3,8,false).health));
 it('raises both unit stats and spell impact',()=>{
  expect(enhanceCampaignCard({id:'u',name:'U',description:'',type:'UNIT',cost:2,attack:3,health:4,keywords:[]},3,12,true)).toMatchObject({attack:8,health:10});
  expect(enhanceCampaignCard({id:'s',name:'S',description:'',type:'SPELL',cost:2,attack:0,health:1,damage:3,keywords:[]},3,12,true).damage).toBe(8);
 });
});
