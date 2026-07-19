import {describe,expect,it} from 'vitest';
import {applyAction,createGame,type EngineCard} from './index.js';

const deck=(prefix:string):EngineCard[]=>Array.from({length:30},(_,index)=>({id:`${prefix}-${index}`,name:`${prefix} ${index}`,type:'UNIT',cost:1,attack:1,health:2,keywords:[]}));

describe('turn lifecycle events',()=>{
 it('records the exact turn for start and end events',()=>{
  let state=createGame({seed:7,players:[{id:'p1',deck:deck('a')},{id:'p2',deck:deck('b')}]});
  const started=applyAction(state,{type:'MULLIGAN',playerId:'p1',cardInstanceIds:[]});expect(started.ok).toBe(true);if(!started.ok)return;state=started.state;
  const ended=applyAction(state,{type:'END_TURN',playerId:'p1'});expect(ended.ok).toBe(true);if(!ended.ok)return;
  expect(ended.state.events.filter(event=>event.type==='TURN_ENDED').at(-1)?.turn).toBe(1);
  expect(ended.state.events.filter(event=>event.type==='TURN_STARTED').at(-1)?.turn).toBe(2);
 });
});
