import{describe,expect,it}from'vitest';
import{unseenBattleEvents}from'./pvp-event-window';

describe('unseenBattleEvents',()=>{
 it('does not replay an old card effect on later state versions',()=>{
  expect(unseenBattleEvents(['summon','turn'],1)).toEqual({fresh:['turn'],next:2});
  expect(unseenBattleEvents(['summon','turn'],2)).toEqual({fresh:[],next:2});
 });
 it('recovers when a new match resets its event list',()=>expect(unseenBattleEvents(['new'],9)).toEqual({fresh:['new'],next:1}));
});
