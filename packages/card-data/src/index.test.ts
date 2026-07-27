import {describe,expect,it} from 'vitest';
import {cardSchema,cards} from './index.js';

const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();

describe('card catalog',()=>{
  it('contains 174 valid unique cards',()=>{
    expect(cards).toHaveLength(174);
    expect(new Set(cards.map(card=>card.code)).size).toBe(174);
    cards.forEach(card=>expect(cardSchema.safeParse(card).success).toBe(true));
  });
  it('has expanded faction counts',()=>{
    expect(cards.filter(card=>card.faction==='IRONVALE')).toHaveLength(62);
    expect(cards.filter(card=>card.faction==='ARCANUM')).toHaveLength(62);
    expect(cards.filter(card=>card.faction==='NEUTRAL')).toHaveLength(50);
  });
  it('contains all nine rarity levels',()=>expect(new Set(cards.map(card=>card.rarity)).size).toBe(9));
  it('contains the complete reservoir mechanic set',()=>expect(cards.filter(card=>{const number=Number(card.code.slice(-3));return number>=51&&number<=53})).toHaveLength(9));
  it('keeps the twelve-card low-cost dawn set',()=>{
    const dawn=cards.filter(card=>{const number=Number(card.code.slice(-3));return number>=54&&number<=57});
    expect(dawn).toHaveLength(12);
    expect(dawn.every(card=>card.cost<=3)).toBe(true);
    expect(new Set(dawn.map(card=>card.rarity)).size).toBeGreaterThanOrEqual(4);
  });
  it('balances every high-rarity frontier unit against its energy cost',()=>{
    const frontier=cards.filter(card=>card.type==='UNIT'&&Number(card.code.slice(-3))>=35&&Number(card.code.slice(-3))<=40);
    expect(frontier).toHaveLength(18);
    expect(frontier.every(card=>(card.attack??0)+(card.health??0)>=card.cost*2)).toBe(true);
    expect(cards.find(card=>card.code==='NE-038')).toMatchObject({rarity:'LEGENDARY',cost:8,attack:13,health:15,keywords:['Rush']});
  });
  it('only grants Foresee to cards that explicitly describe it',()=>{
    const mismatches=cards.filter(card=>card.keywords.includes('Foresee')&&!normalize(card.description).includes('tien kien')).map(card=>card.code);
    expect(mismatches).toEqual([]);
  });
  it('adds two one-of-three server Limited cards',()=>{
    const apex=cards.filter(card=>['IV-058','AR-058'].includes(card.code));
    expect(apex).toHaveLength(2);
    expect(apex.every(card=>card.rarity==='LIMITED'&&card.printLimit===3)).toBe(true);
  });
  it('gives every Limited card a distinct ability profile',()=>{
    const limited=cards.filter(card=>card.rarity==='LIMITED');
    expect(limited).toHaveLength(11);
    expect(new Set(limited.map(card=>card.description)).size).toBe(11);
  });
});
