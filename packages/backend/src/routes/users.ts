import { Router } from 'express';
import prisma from '../lib/prisma';
import { UserRegister, UserInfo, UserLogin } from 'shared';
import { success, error, serverError } from '../utils/response';

const router = Router();

// 注册新用户
router.post('/', async (req, res) => {
  try {
    const { username, password, displayName } = req.body as UserRegister;

    // 验证必填字段
    if (!username || !password || !displayName) {
      return error(res, 400, '用户名、密码、显示名称都是必填的');
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return error(res, 400, '用户名已存在');
    }

    const user: UserInfo = await prisma.user.create({
      data: { username, password, displayName },
    });

    success(res, 201, '注册成功', user);
  } catch (err) {
    console.error('注册失败:', err);
    serverError(res, '注册失败');
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body as UserLogin;

    if (!username || !password) {
      return error(res, 400, '用户名和密码都是必填的');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return error(res, 401, '用户名或密码错误');
    }

    success(res, 200, '登录成功', user);
  } catch (err) {
    console.error('登录失败:', err);
    serverError(res, '登录失败');
  }
});

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });
    success(res, 200, '获取用户列表成功', users);
  } catch (err) {
    console.error('获取用户列表失败:', err);
    serverError(res, '获取用户列表失败');
  }
});

export default router;
