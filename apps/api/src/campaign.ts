import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { db } from './db.js';
import { HttpError, requireAuth } from './http.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const chapters = await db.campaignChapter.findMany({
    orderBy: { number: 'asc' },
    include: { stages: { orderBy: { number: 'asc' }, include: { progress: { where: { userId: req.auth!.sub } } } } },
  });
  res.json(chapters.map(chapter => ({
    ...chapter,
    stages: chapter.stages.map((stage, index) => ({
      ...stage,
      progress: stage.progress[0] ?? null,
      unlocked: index === 0 || chapter.stages[index - 1]?.progress[0]?.completed === true,
    })),
  })));
});

router.post('/stages/:id/start', async (req, res) => {
  const stage = await db.campaignStage.findUnique({
    where: { id: req.params.id },
    include: { chapter: { include: { stages: { orderBy: { number: 'asc' }, include: { progress: { where: { userId: req.auth!.sub } } } } } } },
  });
  if (!stage) throw new HttpError(404, 'STAGE_NOT_FOUND', 'Stage not found');
  const index = stage.chapter.stages.findIndex(item => item.id === stage.id);
  if (index > 0 && !stage.chapter.stages[index - 1]!.progress[0]?.completed) throw new HttpError(403, 'STAGE_LOCKED', 'Complete previous stage');
  res.json({ stageId: stage.id, seed: randomUUID(), enemyDeck: stage.enemyDeck, aiLevel: stage.aiLevel, bossPhases: stage.bossPhases });
});

router.post('/stages/:id/complete', async (req, res) => {
  const input = z.object({ won: z.literal(true), turns: z.number().int().min(1).max(200), leaderHealth: z.number().int().min(1).max(100) }).parse(req.body);
  const stage = await db.campaignStage.findUnique({ where: { id: req.params.id } });
  if (!stage) throw new HttpError(404, 'STAGE_NOT_FOUND', 'Stage not found');
  const stars = input.turns <= 8 && input.leaderHealth >= 70 ? 3 : input.turns <= 14 ? 2 : 1;
  const result = await db.$transaction(async tx => {
    const old = await tx.userStageProgress.findUnique({ where: { userId_stageId: { userId: req.auth!.sub, stageId: stage.id } } });
    const first = !old?.claimedAt;
    const progress = await tx.userStageProgress.upsert({
      where: { userId_stageId: { userId: req.auth!.sub, stageId: stage.id } },
      update: { completed: true, stars: Math.max(old?.stars ?? 0, stars), bestTurns: Math.min(old?.bestTurns ?? 999, input.turns), claimedAt: old?.claimedAt ?? new Date() },
      create: { userId: req.auth!.sub, stageId: stage.id, completed: true, stars, bestTurns: input.turns, claimedAt: new Date() },
    });
    if (first) for (const [code, amount] of [['GOLD', stage.rewardGold], ['DUST', stage.rewardDust]] as const) if (amount) await tx.userCurrency.upsert({ where: { userId_code: { userId: req.auth!.sub, code } }, update: { balance: { increment: amount } }, create: { userId: req.auth!.sub, code, balance: amount } });
    return { progress, reward: first ? { gold: stage.rewardGold, dust: stage.rewardDust } : { gold: 0, dust: 0 }, alreadyClaimed: !first };
  });
  res.json(result);
});

export default router;
