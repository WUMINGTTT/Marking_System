import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { addJudge, getJudges, removeJudge } from '../services/judge';

const router = Router();

router.post('/:eventId', auth, addJudge); //  创建评委
router.get('/:eventId', auth, getJudges); //  获取评委列表
router.delete('/:judgeId', auth, removeJudge); //  删除评委

export default router;
