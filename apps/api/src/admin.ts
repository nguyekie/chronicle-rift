import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { requireAdmin, requireAuth } from './http.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/overview', async (_req, res) => {
  const [users, cards, packs, openings, limited] = await Promise.all([
    db.user.count(), db.card.count(), db.pack.findMany({ orderBy: { code: 'asc' } }),
    db.packOpenHistory.count(), db.card.findMany({ where: { rarity: 'LIMITED' }, select: { name: true, mintedCount: true, printLimit: true } }),
  ]);
  res.json({ users, cards, openings, packs, limited });
});

router.patch('/packs/:id', async (req, res) => {
  const input = z.object({ priceGold: z.number().int().min(0).max(10_000_000).optional(), enabled: z.boolean().optional() }).parse(req.body);
  res.json(await db.pack.update({ where: { id: req.params.id }, data: input }));
});

export default router;
