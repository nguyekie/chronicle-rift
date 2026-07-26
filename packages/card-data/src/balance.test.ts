import {describe,expect,it} from 'vitest';
import {cards} from './index.js';

describe('high-cost card balance',()=>{
  it('scales non-limited high-cost units with cost and rarity',()=>{
    const highCost=cards.filter(card=>card.type==='UNIT'&&card.cost>=6&&card.rarity!=='LIMITED');
    expect(highCost.every(card=>(card.attack??0)+(card.health??0)>=card.cost*2)).toBe(true);
  });

  it('makes Bình Năng Lượng a positive tempo card',()=>{
    expect(cards.find(card=>card.code==='NE-006')).toMatchObject({cost:2,type:'EQUIPMENT'});
  });

  it('gives the ascendant cycle several distinct summon effects',()=>{
    const ascendants=cards.filter(card=>Number(card.code.slice(-3))>=41&&Number(card.code.slice(-3))<=45);
    expect(new Set(ascendants.map(card=>card.description)).size).toBeGreaterThanOrEqual(10);
  });
});
