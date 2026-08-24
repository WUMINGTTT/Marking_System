import { Router } from 'express';
import prisma from '../lib/prisma';

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
    res.json(events);
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
