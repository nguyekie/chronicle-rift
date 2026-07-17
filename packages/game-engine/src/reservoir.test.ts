import { describe, expect, it } from 'vitest';
import { applyAction, createGame, type EngineCard, type GameState } from './index.js';

const filler: EngineCard[] = Array.from({ length: 20 }, (_, i) => ({ id: `f${i}`, name: `Filler ${i}`, type: 'UNIT', cost: 1, attack: 1, health: 2, keywords: [] }));
const unit = (id: string, description: string, cost = 3): EngineCard => ({ id, name: id, description, type: 'UNIT', cost, attack: 3, health: 4, keywords: [] });
const spell = (id: string, description: string, cost = 2): EngineCard => ({ id, name: id, description, type: 'SPELL', cost, keywords: [] });

function ready(card: EngineCard): GameState {
  const state = createGame({ seed: 9, players: [{ id: 'a', deck: [card, ...filler] }, { id: 'b', deck: filler }] });
  state.phase = 'MAIN'; state.turn = 2; state.activePlayerId = 'a'; state.players[0].energy = 10;
  const found = [...state.players[0].hand, ...state.players[0].deck].find(item => item.id === card.id)!;
  state.players[0].hand = [found]; state.players[0].deck = state.players[0].deck.filter(item => item.instanceId !== found.instanceId);
  return state;
}

describe('reservoir card mechanics', () => {
  it('converts up to two remaining energy into stats', () => {
    let state = ready(unit('engineer', 'Triệu hồi: tiêu tối đa 2 Năng lượng còn lại; nhận +1 Công/+1 Máu cho mỗi điểm.'));
    state = applyAction(state, { type: 'PLAY_CARD', playerId: 'a', cardInstanceId: state.players[0].hand[0]!.instanceId, row: 'FRONT' }).state;
    expect(state.players[0].energy).toBe(5);
    expect(state.players[0].board.FRONT[0]).toMatchObject({ currentAttack: 5, currentHealth: 6 });
  });

  it('mana flask has a net gain of one energy', () => {
    let state = ready(spell('flask', 'Thi triển: nhận 3 Năng lượng.'));
    state = applyAction(state, { type: 'PLAY_CARD', playerId: 'a', cardInstanceId: state.players[0].hand[0]!.instanceId }).state;
    expect(state.players[0].energy).toBe(11);
    expect(state.players[1].leaderHealth).toBe(100);
  });

  it('healing spell does not accidentally damage the enemy', () => {
    let state = ready(spell('reverse', 'Thi triển: hồi 8 Máu cho thủ lĩnh.', 4)); state.players[0].leaderHealth = 50;
    state = applyAction(state, { type: 'PLAY_CARD', playerId: 'a', cardInstanceId: state.players[0].hand[0]!.instanceId }).state;
    expect(state.players[0].leaderHealth).toBe(58); expect(state.players[1].leaderHealth).toBe(100);
  });

  it('rift execution destroys only a cheap target', () => {
    let state = ready(spell('rift', 'Thi triển: tiêu diệt một đơn vị có chi phí từ 3 trở xuống.', 4));
    const target = { ...state.players[1].hand[0]!, cost: 3, row: 'FRONT' as const, summonedTurn: 1 };
    state.players[1].board.FRONT = [target];
    state = applyAction(state, { type: 'PLAY_CARD', playerId: 'a', cardInstanceId: state.players[0].hand[0]!.instanceId, targetId: target.instanceId }).state;
    expect(state.players[1].board.FRONT).toHaveLength(0);
  });

  it('unused energy empowers the collector at end of turn', () => {
    let state = ready(unit('collector', 'Cuối lượt: nếu còn ít nhất 5 Năng lượng, nhận +2 Công/+2 Máu.', 4));
    state = applyAction(state, { type: 'PLAY_CARD', playerId: 'a', cardInstanceId: state.players[0].hand[0]!.instanceId, row: 'FRONT' }).state;
    state = applyAction(state, { type: 'END_TURN', playerId: 'a' }).state;
    expect(state.players[0].board.FRONT[0]).toMatchObject({ currentAttack: 5, currentHealth: 6 });
  });
});
