import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  changeUserPassword,
  changeUserName,
} from '../services/user';

const router = Router();

router.post('/register', registerUser); // 注册新用户
router.post('/login', loginUser); // 用户登录
router.get('/', getAllUsers); // 获取所有用户
router.get('/:id', getUserById); // 获取单个用户
router.post('/:id/password', changeUserPassword); // 修改密码
router.post('/:id/name', changeUserName); // 修改昵称

export default router;
