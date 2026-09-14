import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { ResponseUtils } from '../utils/response';

// 扩展 Request：权限中间件通过后挂载活动对象，业务函数可直接取用
declare global {
  namespace Express {
    interface Request {
      event?: {
        id: number;
        name: string;
        description: string | null;
        creatorId: number;
        status: string;
        createdAt: Date;
      };
    }
  }
}

/**
 * 从路由参数中解析出所属活动ID
 */
async function resolveEventId(req: Request): Promise<number | null> {
  // 路由直接提供活动ID
  const eventId = parseInt(req.params.eventId as string);
  if (!Number.isNaN(eventId)) return eventId;

  // 路由提供队伍ID
  const teamId = parseInt(req.params.teamId as string);
  if (!Number.isNaN(teamId)) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    return team?.eventId ?? null;
  }

  // 路由提供评分ID
  const scoreId = parseInt(req.params.scoreId as string);
  if (!Number.isNaN(scoreId)) {
    const score = await prisma.score.findUnique({ where: { id: scoreId } });
    return score?.eventId ?? null;
  }

  // 路由提供评委ID
  const judgeId = parseInt(req.params.judgeId as string);
  if (!Number.isNaN(judgeId)) {
    const judge = await prisma.eventJudge.findUnique({
      where: { id: judgeId },
    });
    return judge?.eventId ?? null;
  }

  return null;
}

/**
 * 要求当前用户是活动创建者
 * 必须挂在 auth 之后
 */
export async function requireCreator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return ResponseUtils.error(res, 401, '未登录');
    }

    const eventId = await resolveEventId(req);
    if (!eventId) {
      return ResponseUtils.error(res, 400, '无效的资源ID');
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (event.creatorId !== userId) {
      return ResponseUtils.error(res, 403, '只有活动创建者才能执行此操作');
    }

    // 挂载活动对象s
    req.event = event;
    next();
  } catch (err) {
    console.error('权限校验失败:', err);
    ResponseUtils.serverError(res, '权限校验失败');
  }
}

/**
 * 要求当前用户是活动评委
 * 必须挂在 auth 之后
 */
export async function requireJudge(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return ResponseUtils.error(res, 401, '未登录');
    }

    const eventId = await resolveEventId(req);
    if (!eventId) {
      return ResponseUtils.error(res, 400, '无效的资源ID');
    }

    const judge = await prisma.eventJudge.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!judge) {
      return ResponseUtils.error(res, 403, '只有活动评委才能执行此操作');
    }

    next();
  } catch (err) {
    console.error('权限校验失败:', err);
    ResponseUtils.serverError(res, '权限校验失败');
  }
}
