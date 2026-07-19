import { Router } from 'express';
import { z } from 'zod';
import { db } from './db.js';
import { HttpError, requireAdmin, requireAuth } from './http.js';

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

router.post('/users/gold',async(req,res)=>{const input=z.object({identity:z.string().trim().min(2).max(120),amount:z.number().int().min(1).max(100_000_000)}).parse(req.body),users=await db.user.findMany({where:{OR:[{email:{equals:input.identity,mode:'insensitive'}},{profile:{displayName:{equals:input.identity,mode:'insensitive'}}}]},select:{id:true,email:true,profile:{select:{displayName:true}}},take:2});if(!users.length)throw new HttpError(404,'USER_NOT_FOUND','Không tìm thấy nhân vật hoặc email này');if(users.length>1)throw new HttpError(409,'AMBIGUOUS_USER','Có nhiều nhân vật trùng tên, hãy nhập email chính xác');const user=users[0]!,wallet=await db.userCurrency.upsert({where:{userId_code:{userId:user.id,code:'GOLD'}},update:{balance:{increment:input.amount}},create:{userId:user.id,code:'GOLD',balance:input.amount}});res.json({user:{email:user.email,displayName:user.profile?.displayName??user.email},added:input.amount,balance:wallet.balance})});

export default router;
