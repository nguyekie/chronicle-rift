import {describe,expect,it} from 'vitest';
import {applyAction,createGame,type EngineCard} from './index.js';

const filler:EngineCard[] = Array.from({length:30},(_,index)=>({
  id:`filler-${index}`,name:`Filler ${index}`,type:'UNIT',cost:1,attack:2,health:3,keywords:[],
}));

function summon(card:EngineCard){
  let state=createGame({seed:17,players:[{id:'a',deck:[card,...filler]},{id:'b',deck:filler}]});
  state.phase='MAIN';state.turn=4;state.activePlayerId='a';state.players[0].energy=20;
  const found=[...state.players[0].hand,...state.players[0].deck].find(item=>item.id===card.id)!;
  state.players[0].hand=[found];
  state.players[0].deck=state.players[0].deck.filter(item=>item.instanceId!==found.instanceId);
  return applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:found.instanceId,row:'FRONT'}).state;
}

describe('ascendant summon effects',()=>{
  it('draws cards and restores energy from a summon description',()=>{
    const card:EngineCard={id:'oracle',name:'Oracle',description:'Triệu hồi: rút 2 lá và nhận 2 Năng lượng.',type:'UNIT',cost:8,attack:11,health:15,keywords:[]};
    const state=summon(card);
    expect(state.players[0].hand).toHaveLength(2);
    expect(state.players[0].energy).toBe(14);
  });

  it('damages the weakest enemy unit',()=>{
    const card:EngineCard={id:'storm',name:'Storm',description:'Triệu hồi: gây 6 sát thương lên đơn vị yếu nhất của địch.',type:'UNIT',cost:8,attack:13,health:16,keywords:[]};
    let state=createGame({seed:19,players:[{id:'a',deck:[card,...filler]},{id:'b',deck:filler}]});
    state.phase='MAIN';state.turn=4;state.activePlayerId='a';state.players[0].energy=20;
    const found=[...state.players[0].hand,...state.players[0].deck].find(item=>item.id===card.id)!;
    state.players[0].hand=[found];
    const enemy=state.players[1].hand[0]!;
    enemy.currentHealth=9;enemy.row='FRONT';state.players[1].board.FRONT=[enemy];
    state=applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:found.instanceId,row:'FRONT'}).state;
    expect(state.players[1].board.FRONT[0]?.currentHealth).toBe(3);
  });
});
