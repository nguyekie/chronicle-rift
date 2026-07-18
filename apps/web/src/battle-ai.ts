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

export type AiStyle='BALANCED'|'IRONVALE'|'ARCANUM'|'BOSS';
export function chooseBattleAiAction(state: GameState, difficulty = 1, style:AiStyle='BALANCED'): GameAction {
  const ai = state.players.find(player => player.id === 'ai')!;
  const human = state.players.find(player => player.id === 'keeper')!;
  if(state.pendingForesee?.playerId===ai.id){const top=ai.deck[0],hasEarly=ai.hand.filter(card=>card.cost<=3).length>=2;return{type:'RESOLVE_FORESEE',playerId:ai.id,choice:top&&top.cost<=Math.max(3,ai.maxEnergy+1)&&!(hasEarly&&top.cost<=2)?'KEEP':'BOTTOM'}}
  const friendly = units(ai);
  const enemies = units(human);
  const ready = friendly.filter(card => !card.attacked && (card.summonedTurn < state.turn || card.keywords.includes('Rush')));
  const taunts = enemies.filter(card => card.keywords.includes('Taunt') && !card.silenced);
  const legalTargets = taunts.length ? taunts : enemies;

  if (!enemies.length && ready.reduce((sum, card) => sum + card.currentAttack, 0) >= human.leaderHealth) {
    const lethal = [...ready].sort((a, b) => b.currentAttack - a.currentAttack)[0]!;
    return { type: 'ATTACK', playerId: ai.id, attackerId: lethal.instanceId, targetId: human.id };
  }

  if (difficulty >= 3 || style==='IRONVALE' || style==='BOSS') {
    const trade = ready.flatMap(attacker => legalTargets
      .filter(target => attacker.currentAttack >= target.currentHealth)
      .map(target => ({ attacker, target, score: value(target) - (target.currentAttack >= attacker.currentHealth ? value(attacker) * .7 : 0) })))
      .sort((a, b) => b.score - a.score)[0];
    if (trade && trade.score > 0) return { type: 'ATTACK', playerId: ai.id, attackerId: trade.attacker.instanceId, targetId: trade.target.instanceId };
  }

  const playable = ai.hand.filter(card => card.cost <= ai.energy && (card.type !== 'UNIT' || rows.some(row => ai.board[row].length < 3)) && (card.type==='UNIT'||enemies.length>0));
  const removal = playable.filter(card => card.type === 'SPELL' && enemies.length)
    .map(card => ({ card, target: [...enemies].filter(target => !target.keywords.includes('Ward')).sort((a, b) => value(b) - value(a))[0] }))
    .filter(choice => choice.target)
    .sort((a, b) => value(b.target!) - value(a.target!))[0];
  if (removal && (difficulty >= 4 || style==='ARCANUM' || style==='BOSS' || value(removal.target!) >= 7)) {
    return { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: removal.card.instanceId, targetId: removal.target!.instanceId };
  }

  const best = [...playable].sort((a, b) => {
    const score = (card: CardInstance) => {
      const remaining=ai.energy-card.cost,followUp=ai.hand.some(other=>other.instanceId!==card.instanceId&&other.cost<=remaining),curveBonus=followUp?3:remaining===0?2:-remaining*.35;
      const survival=card.type==='UNIT'&&card.currentHealth>enemies.reduce((n,target)=>Math.max(n,target.currentAttack),0)?1.5:0;
      return card.cost*1.4+(card.type==='UNIT'?value(card)+(style==='IRONVALE'&&card.keywords.includes('Taunt')?5:0)+survival:(card.damage??1)*(style==='ARCANUM'?3:2)) + curveBonus +(style==='BOSS'?card.keywords.length*2.5:0);
    };
    return score(b) - score(a);
  })[0];
  if (best) return best.type === 'UNIT'
    ? { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: best.instanceId, row: summonRow(best, ai) }
    : { type: 'PLAY_CARD', playerId: ai.id, cardInstanceId: best.instanceId, targetId: removal?.target?.instanceId };

  if (ready.length) {
    const attacker = [...ready].sort((a, b) => b.currentAttack - a.currentAttack)[0]!;
    const safeLeaderAttack=!enemies.length;
    if(safeLeaderAttack)return {type:'ATTACK',playerId:ai.id,attackerId:attacker.instanceId,targetId:human.id};
    const target = [...legalTargets].sort((a, b) => (value(b)-b.currentHealth)-(value(a)-a.currentHealth))[0];
    return { type: 'ATTACK', playerId: ai.id, attackerId: attacker.instanceId, targetId: target?.instanceId ?? human.id };
  }
  return { type: 'END_TURN', playerId: ai.id };
}
