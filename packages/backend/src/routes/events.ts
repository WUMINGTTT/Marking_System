import { Router } from 'express';
import prisma from '../lib/prisma';
import { success, serverError } from '../utils/response';

const router = Router();

// GET /api/events - 获取所有活动
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: { id: true, displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    success(res, events);
  } catch (err) {
    console.error('获取活动列表失败:', err);
    serverError(res);
  }
});

export default router;
