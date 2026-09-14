import prisma from '../lib/prisma';
import { UserInfo, EventInfo, EventCreate } from 'shared';
import { ResponseUtils } from '../utils/response';
import { Request, Response } from 'express';

/**
 * 从 token 中查找当前登录用户
 * @returns 用户对象，如果不存在则返回 null 并自动发送错误响应
 */
async function getUserId(req: Request, res: Response) {
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
  return userId;
}

/**
 * 创建活动
 * @returns 活动对象
 */
export async function createEvent(req: Request, res: Response) {
  try {
    // 获取创建者id
    const creatorId = (await getUserId(req, res)) as number;
    // 获取并校验传递请求参数
    const { name, description }: EventCreate = req.body;
    if (!name) {
      return ResponseUtils.error(res, 400, '活动名称为必填项');
    }
    const newEvent: EventInfo = await prisma.event.create({
      data: { name, description, creatorId },
    });
    return ResponseUtils.success(res, 201, '创建活动成功', newEvent);
  } catch (err) {
    console.error('创建失败:', err);
    return ResponseUtils.serverError(res, '创建活动失败');
  }
}

/**
 * 获取所有活动
 */
export async function getAllEvents(req: Request, res: Response) {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ResponseUtils.success(res, 200, '获取活动列表成功', events);
  } catch (err) {
    console.error('获取失败:', err);
    return ResponseUtils.serverError(res, '获取活动列表失败');
  }
}

/**
 * 获取单个活动
 */
export async function getEventById(req: Request, res: Response) {
  try {
    // 获取并校验请求参数
    let eventId = req.params.eventId;

    if (typeof eventId !== 'string') {
      return ResponseUtils.error(res, 400, '无效的活动ID');
    }
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    return ResponseUtils.success(res, 200, '获取活动成功', event);
  } catch (err) {
    console.error(err);
    return ResponseUtils.serverError(res, '获取活动失败');
  }
}

/**
 * 修改活动信息
 */
export async function updeteEvent(req: Request, res: Response) {
  try {
    // 获取并校验请求参数
    let eventId = req.params.eventId;
    if (typeof eventId !== 'string') {
      return ResponseUtils.error(res, 400, '无效的活动ID');
    }
    const { name, description, status }: EventCreate = req.body;
    if (!name) {
      return ResponseUtils.error(res, 400, '活动名称为必填项');
    }
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }

    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: { name, description, status },
    });
    return ResponseUtils.success(res, 200, '修改活动成功', null);
  } catch (err) {
    console.error(err);
    return ResponseUtils.serverError(res, '修改活动失败');
  }
}

/**
 * 删除活动
 */
export async function deleteEvent(req: Request, res: Response) {
  try {
    // 获取并校验请求参数
    let eventId = req.params.eventId;
    if (typeof eventId !== 'string') {
      return ResponseUtils.error(res, 400, '无效的活动ID');
    }
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    await prisma.event.delete({
      where: { id: parseInt(eventId) },
    });
    return ResponseUtils.success(res, 200, '删除活动成功', null);
  } catch (err) {
    console.error(err);
    if ((err as any)?.code === 'P2003') {
      return ResponseUtils.error(res, 400, '该活动存在关联数据，无法删除');
    }
    return ResponseUtils.serverError(res, '删除活动失败');
  }
}

/**
 * 获取所有活动（包含所有关联数据）
 */
export async function allEvents(req: Request, res: Response) {
  try {
    const events = await prisma.event.findMany({
      include: {
        creator: {
          select: { id: true, name: true },
        },
        judges: {
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
        },
        teams: {
          include: {
            scores: {
              include: {
                judge: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ResponseUtils.success(res, 200, '获取活动列表成功', events);
  } catch (err) {
    console.error('获取失败:', err);
    return ResponseUtils.serverError(res, '获取活动列表失败');
  }
}
