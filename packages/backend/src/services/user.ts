import prisma from '../lib/prisma';
import { UserRegister, UserInfo, UserLogin, changePassword } from 'shared';
import { success, error, serverError } from '../utils/response';
import { PasswordUtils } from '../utils/password';
import { Request, Response } from 'express';

/**
 * 根据请求参数查找用户
 * @returns 用户对象，如果不存在则返回 null 并自动发送错误响应
 */
async function findUserByIdFromParams(req: Request, res: Response) {
  const id = req.params.id as string;
  if (typeof id !== 'string') {
    error(res, 400, '无效的用户ID');
    return null;
  }
  const userId = parseInt(id);
  const user: UserInfo | null = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
    },
  });
  if (!user) {
    error(res, 404, '用户不存在');
    return null;
  }
  return user;
}

// 注册新用户
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, password, name } = req.body as UserRegister;

    // 验证必填字段
    if (!username || !password || !name) {
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

    const user : UserInfo | null = await prisma.user.create({
      data: { username, password: hashedPassword, name },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
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

    const user: (UserInfo & { password: string }) | null = await prisma.user.findUnique({
      where: { username },
    });

    // 验证密码
    if (
      !user ||
      !(await PasswordUtils.comparePassword(password, user.password))
    ) {
      return error(res, 401, '用户名或密码错误');
    }

    const { password: _, ...safeUser } = user;
    success(res, 200, '登录成功', safeUser);
  } catch (err) {
    console.error('登录失败:', err);
    serverError(res, '登录失败');
  }
}

// 删除用户
export async function deleteUser(req: Request, res: Response) {
  try {
    const user: UserInfo | null = await findUserByIdFromParams(req, res);
    if (!user) return;

    await prisma.user.delete({
      where: { id: user.id },
    });
    success(res, 200, '删除用户成功', null);
  } catch (err) {
    console.error('删除用户失败:', err);
    serverError(res, '删除用户失败');
  }
}

// 获取所有用户
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
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
    const user: UserInfo | null = await findUserByIdFromParams(req, res);
    if (!user) return;

    success(res, 200, '获取用户成功', user);
  } catch (err) {
    console.error('获取用户失败:', err);
    serverError(res, '获取用户失败');
  }
}

// 用户修改密码
export async function changeUserPassword(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (typeof id !== 'string') {
      error(res, 400, '无效的用户ID');
      return null;
    }
    const userId = parseInt(id);
    const user: (UserInfo & { password: string }) | null = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return;

    const { oldPassword, newPassword } = req.body as changePassword;

    if (!(await PasswordUtils.comparePassword(oldPassword, user.password))) {
      return error(res, 400, '旧密码错误');
    }
    if (await PasswordUtils.comparePassword(newPassword, user.password)) {
      return error(res, 400, '新密码不能与旧密码相同');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: await PasswordUtils.hashPassword(newPassword) },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      }
    });

    success(res, 200, '修改密码成功', updatedUser);
  } catch (err) {
    console.error('修改密码失败:', err);
    serverError(res, '修改密码失败');
  }
}

// 用户修改昵称
export async function changeUserName(req: Request, res: Response) {
  try {
    const user: UserInfo | null = await findUserByIdFromParams(req, res);
    if (!user) return;

    const { newName } = req.body;
    if (!newName) {
      return error(res, 400, '昵称不能为空');
    }

    const updatedUser: UserInfo | null = await prisma.user.update({
      where: { id: user.id },
      data: { name: newName },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      }
    });

    success(res, 200, '修改昵称成功', updatedUser);
  } catch (err) {
    console.error('修改昵称失败:', err);
    serverError(res, '修改昵称失败');
  }
}
