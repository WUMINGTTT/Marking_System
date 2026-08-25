import prisma from '../lib/prisma';
import { UserRegister, UserInfo, UserLogin } from 'shared';
import { success, error, serverError } from '../utils/response';
import { PasswordUtils } from '../utils/password';
import { Request, Response } from 'express';

// 注册新用户
export async function registerUser(req: Request, res: Response) {
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

    // 加密密码
    const hashedPassword = await PasswordUtils.hashPassword(password);

    const user: UserInfo = await prisma.user.create({
      data: { username, password: hashedPassword, displayName },
    });

    success(res, 201, '注册成功', user);
  } catch (err) {
    console.error('注册失败:', err);
    serverError(res, '注册失败');
  }
}

// 登录用户
export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body as UserLogin;

    if (!username || !password) {
      return error(res, 400, '用户名和密码都是必填的');
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    // 验证密码
    if (!user || await PasswordUtils.comparePassword(password, user.password)) {
      return error(res, 401, '用户名或密码错误');
    }

    success(res, 200, '登录成功', user);
  } catch (err) {
    console.error('登录失败:', err);
    serverError(res, '登录失败');
  }
}

// 获取所有用户
export async function getAllUsers(req: Request, res: Response) {
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
}

// 获取单个用户
export async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (typeof id !== 'string') {
      return error(res, 400, '无效的用户ID');
    }
    const userId = parseInt(id);

    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error(res, 404, '用户不存在');
    }

    success(res, 200, '获取用户成功', user);
  } catch (err) {
    console.error('获取用户失败:', err);
    serverError(res, '获取用户失败');
  }
}
