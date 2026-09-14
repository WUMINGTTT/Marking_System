import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
} from '../services/team';

const router = Router();

router.post('/:eventId', auth, createTeam); //  创建队伍
router.get('/getall/:eventId', auth, getTeams); //  获取队伍列表
router.get('/:teamId', auth, getTeamById); //  获取队伍详情
router.put('/:teamId', auth, updateTeam); //  更新队伍
router.delete('/:teamId', auth, deleteTeam); //  删除队伍

export default router;
