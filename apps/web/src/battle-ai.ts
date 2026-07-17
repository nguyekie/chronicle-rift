import type { CardInstance, GameAction, GameState, Row } from '@chronicle/game-engine';

const rows: Row[] = ['FRONT', 'MIDDLE', 'BACK'];
const units = (player: GameState['players'][number]) => rows.flatMap(row => player.board[row]);
const value = (card: CardInstance) => card.currentAttack * 1.6 + card.currentHealth + card.cost * .35 + card.keywords.length * 1.4;

function summonRow(card: CardInstance, ai: GameState['players'][number]): Row {
  const open = rows.filter(row => ai.board[row].length < 3);
  if (card.keywords.includes('Taunt')) return open.includes('FRONT') ? 'FRONT' : open[0]!;
  if (card.currentHealth <= 2) return open.includes('BACK') ? 'BACK' : open.at(-1)!;
  return [...open].sort((a, b) => ai.board[a].length - ai.board[b].length)[0]!;
}

export function chooseBattleAiAction(state: GameState, difficulty = 1): GameAction {
  const ai = state.players.find(player => player.id === 'ai')!;
  const human = state.players.find(player => player.id === 'keeper')!;
  const friendly = units(ai);
  const enemies = units(human);
  const ready = friendly.filter(card => !card.attacked && (card.summonedTurn < state.turn || card.keywords.includes('Rush')));
  const taunts = enemies.filter(card => card.keywords.includes('Taunt') && !card.silenced);
  const legalTargets = taunts.length ? taunts : enemies;

  if (!taunts.length && ready.reduce((sum, card) => sum + card.currentAttack, 0) >= human.leaderHealth) {
    const lethal = [...ready].sort((a, b) => b.currentAttack - a.currentAttack)[0]!;
    return { type: 'ATTACK', playerId: ai.id, attackerId: lethal.instanceId, targetId: human.id };
  }

  if (difficulty >= 3) {
    const trade = ready.flatMap(attacker => legalTargets
      .filter(target => attacker.currentAttack >= target.currentHealth)
      .map(target => ({ attacker, target, score: value(target) - (target.currentAttack >= attacker.currentHealth ? value(attacker) * .7 : 0) })))
      .sort((a, b) => b.score - a.score)[0];
    if (trade && trade.score > 0) return { type: 'ATTACK', playerId: ai.id, attackerId: trade.attacker.instanceId, targetId: trade.target.instanceId };
  }

  const playable = ai.hand.filter(card => card.cost <= ai.energy && (card.type !== 'UNIT' || rows.some(row => ai.board[row].length < 3)));
  const removal = playable.filter(card => card.type === 'SPELL' && enemies.length)
    .map(card => ({ card, target: [...enemies].filter(target => !target.keywords.includes('Ward')).sort((a, b) => value(b) - value(a))[0] }))
    .filter(choice => choice.target)
    .sort((a, b) => value(b.target!) - value(a.target!))[0];
  if (removal && (difficulty >= 4 || value(removal.target!) >= 7)) {
    return { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: removal.card.instanceId, targetId: removal.target!.instanceId };
  }

  const best = playable.sort((a, b) => {
    const score = (card: CardInstance) => card.cost * 2 + (card.type === 'UNIT' ? value(card) : (card.damage ?? 1) * 1.8) + (card.cost === ai.energy ? 2 : 0);
    return score(b) - score(a);
  })[0];
  if (best) return best.type === 'UNIT'
    ? { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: best.instanceId, row: summonRow(best, ai) }
    : { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: best.instanceId, targetId: removal?.target?.instanceId };

  if (ready.length) {
    const attacker = [...ready].sort((a, b) => b.currentAttack - a.currentAttack)[0]!;
    const target = [...legalTargets].sort((a, b) => a.currentHealth - b.currentHealth)[0];
    return { type: 'ATTACK', playerId: ai.id, attackerId: attacker.instanceId, targetId: target?.instanceId ?? human.id };
  }
  return { type: 'END_TURN', playerId: ai.id };
}

