import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  createScore,
  getScores,
  updateScore,
  clearScore,
  removeScoreById,
  getAverageScore,
  getAllAverageScore,
} from '../services/score';
import { requireCreator, requireJudge } from '../middlewares/require';

const router = Router();

router.post('/:teamId', auth, requireJudge, createScore); //  创建得分
router.get('/:teamId', auth, getScores); //  获取得分列表
router.get('/getaverage/:teamId', auth, getAverageScore); //  获取队伍平均分
router.get('/getallaverage/:eventId', auth, getAllAverageScore); //  获取所有队伍的平均分
router.put('/:teamId', auth, requireJudge, updateScore); //  更新得分
router.delete('/clearall/:teamId', auth, requireCreator, clearScore); //  清空得分
router.delete('/:scoreId', auth, requireJudge, removeScoreById); //  删除得分

export default router;
