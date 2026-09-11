import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  getAllEvents,
  createEvent,
  getEventById,
  updeteEvent,
  deleteEvent,
} from '../services/event';

const router = Router();

router.post('/', auth, createEvent); // 创建活动
router.get('/', auth, getAllEvents); // 获取所有活动
router.get('/:id', auth, getEventById); // 获取单个活动
router.put('/:id', auth, updeteEvent); // 修改活动
router.delete('/:id', auth, deleteEvent); // 删除活动

export default router;
