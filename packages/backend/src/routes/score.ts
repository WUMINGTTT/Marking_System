import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  createScore,
  getScores,
  updateScore,
  clearScore,
  removeScoreById,
} from '../services/score';

const router = Router();

router.post('/:teamId', auth, createScore); //  创建得分
router.get('/:teamId', auth, getScores); //  获取得分列表
router.put('/:teamId', auth, updateScore); //  更新得分
router.delete('/clearall/:teamId', auth, clearScore); //  清空得分
router.delete('/:scoreId', auth, removeScoreById); //  删除得分

export default router;
