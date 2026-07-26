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

  it('lets the Last Emperor seal every enemy attack and shield allies',()=>{
    const emperor:EngineCard={id:'emperor',name:'Hoàng Đế Tận Nhật',description:'Triệu hồi: phong ấn toàn bộ quân địch, đặt Công của chúng còn 1; toàn bộ đồng minh nhận Khiên chắn.',type:'UNIT',cost:10,attack:30,health:38,keywords:['Shield']};
    let state=createGame({seed:23,players:[{id:'a',deck:[emperor,...filler]},{id:'b',deck:filler}]});
    state.phase='MAIN';state.turn=10;state.activePlayerId='a';state.players[0].energy=20;
    const found=[...state.players[0].hand,...state.players[0].deck].find(item=>item.id==='emperor')!;
    state.players[0].hand=[found];
    const foe=state.players[1].hand[0]!;foe.currentAttack=12;foe.row='FRONT';state.players[1].board.FRONT=[foe];
    state=applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:found.instanceId,row:'FRONT'}).state;
    expect(state.players[1].board.FRONT[0]?.currentAttack).toBe(1);
    expect(state.players[0].board.FRONT[0]?.shield).toBe(true);
  });

  it('lets Lyra invert enemy stats and grant its resource package',()=>{
    const lyra:EngineCard={id:'lyra',name:'Lyra',description:'Triệu hồi: đảo Công và Máu của toàn bộ quân địch, rút 3 lá và nhận 3 Năng lượng.',type:'UNIT',cost:10,attack:25,health:32,keywords:[]};
    let state=createGame({seed:29,players:[{id:'a',deck:[lyra,...filler]},{id:'b',deck:filler}]});
    state.phase='MAIN';state.turn=10;state.activePlayerId='a';state.players[0].energy=20;
    const found=[...state.players[0].hand,...state.players[0].deck].find(item=>item.id==='lyra')!;
    state.players[0].hand=[found];state.players[0].deck=state.players[0].deck.filter(card=>card.instanceId!==found.instanceId);
    const foe=state.players[1].hand[0]!;foe.currentAttack=8;foe.currentHealth=3;foe.row='FRONT';state.players[1].board.FRONT=[foe];
    state=applyAction(state,{type:'PLAY_CARD',playerId:'a',cardInstanceId:found.instanceId,row:'FRONT'}).state;
    expect(state.players[1].board.FRONT[0]).toMatchObject({currentAttack:3,currentHealth:8});
    expect(state.players[0].hand).toHaveLength(3);
    expect(state.players[0].energy).toBe(13);
  });
});
