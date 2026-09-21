import prisma from '../lib/prisma';
import { UserRegister, UserInfo, UserLogin, ChangePassword } from 'shared';
import { ResponseUtils } from '../utils/response';
import { PasswordUtils } from '../utils/password';
import { JwtUtils } from '../utils/jwt';
import { Request, Response } from 'express';

/**
 * 从 token 中查找当前登录用户
 * @returns 用户对象，如果不存在则返回 null 并自动发送错误响应
 */
async function findCurrentUser(req: Request, res: Response) {
  const userId = req.user?.userId;

  if (!userId) {
    return ResponseUtils.error(res, 401, '未登录');
  }
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
    return ResponseUtils.error(res, 404, '用户不存在');
  }
  return user;
}

/**
 * 注册新用户
 */
export async function registerUser(req: Request, res: Response) {
  try {
    const { username, password, name }: UserRegister = req.body;

    // 验证必填字段
    if (!username || !password || !name) {
      return ResponseUtils.error(res, 400, '用户名、密码、昵称都是必填的');
    }

    if (password.length < 6) {
      return ResponseUtils.error(res, 400, '密码长度不能小于6位');
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return ResponseUtils.error(res, 400, '用户名已存在');
    }

    // 加密密码
    const hashedPassword = await PasswordUtils.hashPassword(password);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return ResponseUtils.success(res, 201, '注册成功', user);
  } catch (err) {
    console.error('注册失败:', err);
    return ResponseUtils.serverError(res, '注册失败');
  }
}

/**
 * 登录用户
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password }: UserLogin = req.body;

    if (!username || !password) {
      return ResponseUtils.error(res, 400, '用户名和密码都是必填的');
    }

    const user: (UserInfo & { password: string }) | null =
      await prisma.user.findUnique({
        where: { username },
      });

    // 验证密码
    if (
      !user ||
      !(await PasswordUtils.comparePassword(password, user.password))
    ) {
      return ResponseUtils.error(res, 401, '用户名或密码错误');
    }

    const { password: _, ...safeUser } = user;

    const token = JwtUtils.signToken({
      userId: user.id,
      username: user.username,
    });

    const safeUserWithToken = {
      ...safeUser,
      token: token,
    };
    return ResponseUtils.success(res, 200, '登录成功', safeUserWithToken);
  } catch (err) {
    console.error('登录失败:', err);
    return ResponseUtils.serverError(res, '登录失败');
  }
}

/**
 * 删除用户
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const user = (await findCurrentUser(req, res)) as UserInfo;

    // // 检查用户是否是当前登录用户
    // const userId = req.user?.userId as number;
    // if (user.id !== userId) {
    //   return ResponseUtils.error(res, 403, '您没有权限删除其他用户');
    // }

    // 删除用户
    await prisma.user.delete({
      where: { id: user.id },
    });
    return ResponseUtils.success(res, 200, '删除用户成功', null);
  } catch (err) {
    console.error('删除用户失败:', err);
    // 处理关联数据错误
    if ((err as any)?.code === 'P2003') {
      return ResponseUtils.error(res, 400, '该用户存在关联数据，无法删除');
    }
    return ResponseUtils.serverError(res, '删除用户失败');
  }
}

/**
 * 获取所有用户
 */
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
    return ResponseUtils.success(res, 200, '获取用户列表成功', users);
  } catch (err) {
    console.error('获取用户列表失败:', err);
    return ResponseUtils.serverError(res, '获取用户列表失败');
  }
}

/**
 * 获取单个用户
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      return ResponseUtils.error(res, 400, '无效的用户ID');
    }
    const user: UserInfo | null = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return ResponseUtils.success(res, 200, '获取用户成功', user);
  } catch (err) {
    console.error('获取用户失败:', err);
    return ResponseUtils.serverError(res, '获取用户失败');
  }
}

/**
 * 用户修改密码
 */
export async function changeUserPassword(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return ResponseUtils.error(res, 401, '未登录');
    }

    const user: (UserInfo & { password: string }) | null =
      await prisma.user.findUnique({
        where: { id: userId },
      });
    if (!user) {
      return ResponseUtils.error(res, 404, '用户不存在');
    }

    const { oldPassword, newPassword }: ChangePassword = req.body;

    if (!oldPassword || !newPassword) {
      return ResponseUtils.error(res, 400, '旧密码和新密码都是必填的');
    }
    if (newPassword.length < 6) {
      return ResponseUtils.error(res, 400, '新密码长度不能小于6位');
    }

    if (!(await PasswordUtils.comparePassword(oldPassword, user.password))) {
      return ResponseUtils.error(res, 400, '旧密码错误');
    }
    if (await PasswordUtils.comparePassword(newPassword, user.password)) {
      return ResponseUtils.error(res, 400, '新密码不能与旧密码相同');
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: await PasswordUtils.hashPassword(newPassword) },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return ResponseUtils.success(res, 200, '修改密码成功', updatedUser);
  } catch (err) {
    console.error('修改密码失败:', err);
    return ResponseUtils.serverError(res, '修改密码失败');
  }
}

/**
 * 用户修改昵称
 */
export async function changeUserName(req: Request, res: Response) {
  try {
    const { newName } = req.body;

    if (!newName) {
      return ResponseUtils.error(res, 400, '昵称不能为空');
    }

    const user = await findCurrentUser(req, res);
    if (!user) return;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: newName },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
      },
    });

    return ResponseUtils.success(res, 200, '修改昵称成功', updatedUser);
  } catch (err) {
    console.error('修改昵称失败:', err);
    return ResponseUtils.serverError(res, '修改昵称失败');
  }
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(req: Request, res: Response) {
  try {
    const user = await findCurrentUser(req, res);
    if (!user) return;

    return ResponseUtils.success(res, 200, '获取用户信息成功', user);
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return ResponseUtils.serverError(res, '获取用户信息失败');
  }
}
