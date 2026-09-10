import { Router } from 'express';
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

router.post('/register', registerUser); // 用户注册
router.post('/login', loginUser); // 用户登录
router.delete('/:id', deleteUser); // 删除用户
router.get('/', getAllUsers); // 获取用户列表
router.get('/:id', getUserById); // 获取单个用户
router.put('/password/:id', changeUserPassword); // 修改密码
router.put('/:id', changeUserName); // 修改昵称

export default router;
