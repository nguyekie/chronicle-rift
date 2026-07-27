import { describe, expect, it } from 'vitest';
import { applyAction, createGame, type EngineCard, type GameState } from './index.js';

const filler=(index:number):EngineCard=>({id:`f-${index}`,name:`Filler ${index}`,type:'UNIT',cost:0,attack:1,health:1,keywords:[]});
const seal=(id:string,name:string):EngineCard=>({id,name,description:'Tam Ấn Khải Hoàn.',type:'UNIT',cost:0,attack:1,health:2,keywords:[]});
function ready(cards:EngineCard[]){
 const deck=[...cards,...Array.from({length:30-cards.length},(_,index)=>filler(index))];
 const state=createGame({seed:17,players:[{id:'a',deck},{id:'b',deck:Array.from({length:30},(_,index)=>filler(index+50))}]});
 state.phase='MAIN';state.activePlayerId='a';state.turn=1;state.players[0].energy=20;
 const wanted=new Set(cards.map(card=>card.id)),all=[...state.players[0].hand,...state.players[0].deck];
 state.players[0].hand=all.filter(card=>wanted.has(card.id));state.players[0].deck=all.filter(card=>!wanted.has(card.id));
 return state;
}
describe('fate cards and the Three Seals',()=>{
 it('wins immediately only after all three different seals are on the board',()=>{
  let state:GameState=ready([seal('NE-065','Nhãn Ấn'),seal('NE-066','Thủ Ấn'),seal('NE-067','Tâm Ấn')]);
  for(const [index,card] of [...state.players[0].hand].entries()){
   state=applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:card.instanceId,row:index===2?'MIDDLE':'FRONT'}).state;
   if(index<2)expect(state.phase).toBe('MAIN');
  }
  expect(state.phase).toBe('ENDED');expect(state.winnerId).toBe('a');
  expect(state.events.some(event=>event.type==='TRINITY_VICTORY')).toBe(true);
 });
 it('resolves and records a seeded fate roll',()=>{
  const fate:EngineCard={id:'NE-064',name:'Kẻ Gieo Xúc Xắc Thiên Hà',description:'Vận may.',type:'UNIT',cost:0,attack:7,health:7,keywords:[]};
  let state=ready([fate]);const card=state.players[0].hand[0]!;
  state=applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:card.instanceId,row:'FRONT'}).state;
  expect(state.events.some(event=>event.type==='FATE_DICE')).toBe(true);
  expect(state.players[0].board.FRONT[0]!.currentAttack).toBeGreaterThan(7);
 });
});
