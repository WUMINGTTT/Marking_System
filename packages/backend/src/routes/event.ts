import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  getAllEvents,
  createEvent,
  getEventById,
  updeteEvent,
  deleteEvent,
  allEvents,
} from '../services/event';
import { requireCreator } from '../middlewares/require';

const router = Router();

router.post('/', auth, createEvent); // 创建活动
router.get('/', auth, getAllEvents); // 获取所有活动
router.get('/getbyid/:eventId', auth, getEventById); // 获取单个活动
router.put('/:eventId', auth, requireCreator, updeteEvent); // 修改活动
router.delete('/:eventId', auth, requireCreator, deleteEvent); // 删除活动

router.get('/all', auth, allEvents); // 获取所有活动（包含所有关联数据）

export default router;
