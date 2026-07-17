import { describe, expect, it } from 'vitest';
import { createGame, type EngineCard } from '@chronicle/game-engine';
import { chooseBattleAiAction } from './battle-ai';

const deck: EngineCard[] = Array.from({ length: 30 }, (_, index) => ({ id: `u${index}`, name: `Unit ${index}`, type: 'UNIT', cost: 1, attack: 2, health: 2, keywords: [] }));
const match = () => {
  const state = createGame({ seed: 4, players: [{ id: 'keeper', deck }, { id: 'ai', deck }] });
  state.phase = 'MAIN'; state.turn = 4; state.activePlayerId = 'ai';
  return state;
};

describe('battle AI', () => {
  it('takes lethal before playing another card', () => {
    const state = match(), attacker = state.players[1].hand[0]!;
    Object.assign(attacker, { ownerId: 'ai', summonedTurn: 1, attacked: false, currentAttack: 8 });
    state.players[1].board.FRONT.push(attacker); state.players[0].leaderHealth = 8;
    expect(chooseBattleAiAction(state, 5)).toMatchObject({ type: 'ATTACK', targetId: 'keeper' });
  });

  it('removes a valuable enemy on harder maps', () => {
    const state = match(), spell = state.players[1].hand[0]!, enemy = state.players[0].hand[0]!;
    Object.assign(spell, { type: 'SPELL', cost: 1, damage: 3 });
    Object.assign(enemy, { ownerId: 'keeper', currentAttack: 8, currentHealth: 8 });
    state.players[0].board.FRONT.push(enemy); state.players[1].energy = 3;
    expect(chooseBattleAiAction(state, 5)).toMatchObject({ type: 'PLAY_CARD', targetId: enemy.instanceId });
  });
});
