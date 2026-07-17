import{describe,it,expect}from'vitest';import{nextPity,pickRarity,pickPackRarity,ratesFor,craftCost,dismantleValue}from'./pack-logic.js';
describe('pack economy',()=>{
 it('hard pity',()=>expect(pickRarity(.99,0,40)).toBe('LEGENDARY'));
 it('celestial is the rarest normal roll',()=>expect(pickRarity(.00001,0,0)).toBe('CELESTIAL'));
 it('mythic roll',()=>expect(pickRarity(.0002,0,0)).toBe('MYTHIC'));
 it('rarity decreases monotonically',()=>{expect(pickRarity(.002,0,0)).toBe('ANCIENT');expect(pickRarity(.01,0,0)).toBe('LEGENDARY');expect(pickRarity(.04,0,0)).toBe('EPIC')});
 it('uses different rates for each pack',()=>{expect(ratesFor('STARTER').COMMON).toBe(70);expect(ratesFor('RIFT_SEAL').LEGENDARY).toBe(5);expect(ratesFor('RIFT_SEAL').LIMITED).toBe(.5);expect(ratesFor('IRONVALE').EPIC).toBe(6)});
 it('rift seal rolls high rarity more often',()=>{expect(pickPackRarity('RIFT_SEAL',.01,0,0)).toBe('MYTHIC');expect(pickPackRarity('STARTER',.01,0,0)).toBe('RARE')});
 it('resets pity',()=>expect(nextPity(12,39,['CELESTIAL']).legendaryMisses).toBe(0));
 it('craft costs more',()=>expect(craftCost.CELESTIAL).toBeGreaterThan(dismantleValue.CELESTIAL));
});
