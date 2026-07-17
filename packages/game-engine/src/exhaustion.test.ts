import { describe, expect, it } from 'vitest';
import { applyAction, createGame, type EngineCard } from './index.js';

const deck: EngineCard[] = Array.from({ length: 8 }, (_, index) => ({
  id: `unit-${index}`,
  name: `Unit ${index}`,
  type: 'UNIT',
  cost: 1,
  attack: 1,
  health: 1,
  keywords: [],
}));

function exhaustedMatch(firstHealth: number, secondHealth: number) {
  const state = createGame({ seed: 7, players: [{ id: 'a', deck }, { id: 'b', deck }] });
  state.phase = 'MAIN';
  state.turn = 2;
  state.activePlayerId = 'a';
  state.players[0].deck = [];
  state.players[0].leaderHealth = firstHealth;
  state.players[1].leaderHealth = secondHealth;
  return applyAction(state, { type: 'END_TURN', playerId: 'a' }).state;
}

describe('leader health and deck exhaustion', () => {
  it('starts both leaders at 100 health', () => {
    const state = createGame({ seed: 7, players: [{ id: 'a', deck }, { id: 'b', deck }] });
    expect(state.players.map(player => player.leaderHealth)).toEqual([100, 100]);
  });

  it('awards the match to the leader with more health when a deck is empty', () => {
    const state = exhaustedMatch(42, 63);
    expect(state.phase).toBe('ENDED');
    expect(state.winnerId).toBe('b');
    expect(state.events.at(-1)?.type).toBe('DECK_EXHAUSTED');
  });

  it('ends in a draw when both leaders have equal health', () => {
    const state = exhaustedMatch(55, 55);
    expect(state.phase).toBe('ENDED');
    expect(state.winnerId).toBeNull();
  });
});
