import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  changeUserPassword,
  changeUserName,
  deleteUser,
} from '../services/user';

const router = Router();

router.post('/register', registerUser); // 用户注册（无需令牌校验）
router.post('/login', loginUser); // 用户登录（无需令牌校验）
router.delete('/', auth, deleteUser); // 删除用户
router.get('/', auth, getAllUsers); // 获取用户列表
router.get('/:id', auth, getUserById); // 获取单个用户
router.put('/password', auth, changeUserPassword); // 修改密码
router.put('/name', auth, changeUserName); // 修改昵称

export default router;
