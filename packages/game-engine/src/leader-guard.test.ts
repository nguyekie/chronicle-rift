import { describe, expect, it } from 'vitest';
import { applyAction, createGame, type EngineCard } from './index.js';

const unit=(id:string):EngineCard=>({id,name:id,type:'UNIT',cost:1,attack:3,health:3,keywords:['Rush']});
const deck=Array.from({length:20},(_,index)=>unit(`unit-${index}`));

describe('leader protection',()=>{
 it('blocks direct attacks while the defending board has a unit',()=>{
  const state=createGame({seed:9,players:[{id:'a',deck},{id:'b',deck}]});
  state.phase='MAIN';state.turn=2;state.activePlayerId='a';
  const attacker={...state.players[0].hand[0]!,row:'FRONT' as const,summonedTurn:1,attacked:false};
  const defender={...state.players[1].hand[0]!,row:'FRONT' as const,summonedTurn:1,attacked:false};
  state.players[0].board.FRONT=[attacker];state.players[1].board.FRONT=[defender];
  const result=applyAction(state,{type:'ATTACK',playerId:'a',attackerId:attacker.instanceId,targetId:'b'});
  expect(result.ok).toBe(false);
  if(!result.ok)expect(result.error).toBe('BOARD_BLOCKS');
  expect(result.state.players[1].leaderHealth).toBe(100);
 });
});
