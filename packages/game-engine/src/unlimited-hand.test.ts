import { describe, expect, it } from 'vitest';
import { applyAction, createGame, type EngineCard } from './index.js';

const deck:EngineCard[]=Array.from({length:30},(_,index)=>({id:`card-${index}`,name:`Card ${index}`,type:'UNIT',cost:1,attack:1,health:1,keywords:[]}));

describe('unlimited hand',()=>{
 it('keeps cards drawn beyond seven',()=>{
  let state=createGame({seed:12,players:[{id:'a',deck},{id:'b',deck}]});
  state.phase='MAIN';state.turn=2;state.activePlayerId='a';
  while(state.players[0].hand.length<7)state.players[0].hand.push(state.players[0].deck.shift()!);
  state=applyAction(state,{type:'END_TURN',playerId:'a'}).state;
  state=applyAction(state,{type:'END_TURN',playerId:'b'}).state;
  expect(state.players[0].hand).toHaveLength(8);
 });
});
