import prisma from '../lib/prisma';
import { ScoreInfo } from 'shared';
import { ResponseUtils } from '../utils/response';
import { Request, Response } from 'express';

/**
 * 创建得分
 */
export async function createScore(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    const score: number = req.body.value;
    if (!score) {
      return ResponseUtils.error(res, 400, '得分信息是必填的');
    }
    // 判断队伍是否存在
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    // 判断活动是否存在
    const event = await prisma.event.findUnique({
      where: {
        id: team.eventId,
      },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (!req.user) {
      return ResponseUtils.error(res, 401, '未认证');
    }
    // 判断同一评委是否重复评分
    const existingScore = await prisma.score.findUnique({
      where: {
        eventId_teamId_judgeId: {
          teamId,
          eventId: team.eventId,
          judgeId: req.user.userId,
        },
      },
    });
    if (existingScore) {
      return ResponseUtils.error(res, 400, '重复评分');
    }
    // 添加得分
    const newScore = await prisma.score.create({
      data: {
        teamId,
        eventId: team.eventId,
        judgeId: req.user.userId,
        value: score,
      },
    });

    return ResponseUtils.success(res, 201, '创建得分成功', newScore);
  } catch (err) {
    console.error('创建得分失败:', err);
    return ResponseUtils.serverError(res, '创建得分失败');
  }
}

/**
 * 获取得分列表
 */
export async function getScores(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    // 判断队伍是否存在
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    // 判断活动是否存在
    const event = await prisma.event.findUnique({
      where: {
        id: team.eventId,
      },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (!req.user) {
      return ResponseUtils.error(res, 401, '未认证');
    }
    // 获取得分列表
    const scores = await prisma.score.findMany({
      where: {
        teamId,
        eventId: team.eventId,
      },
    });
    return ResponseUtils.success(res, 200, '获取得分列表成功', scores);
  } catch (err) {
    console.error('获取得分列表失败:', err);
    return ResponseUtils.serverError(res, '获取得分列表失败');
  }
}

/**
 * 更新得分
 */
export async function updateScore(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    const score: number = req.body.value;
    if (!score) {
      return ResponseUtils.error(res, 400, '得分信息是必填的');
    }
    // 判断队伍是否存在
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    // 判断活动是否存在
    const event = await prisma.event.findUnique({
      where: {
        id: team.eventId,
      },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (!req.user) {
      return ResponseUtils.error(res, 401, '未认证');
    }

    // 更新得分
    await prisma.score.update({
      where: {
        eventId_teamId_judgeId: {
          teamId,
          eventId: team.eventId,
          judgeId: req.user.userId,
        },
      },
      data: {
        value: score,
      },
    });
    return ResponseUtils.success(res, 200, '更新得分成功', null);
  } catch (err) {
    console.error('更新得分失败:', err);
    return ResponseUtils.serverError(res, '更新得分失败');
  }
}

/**
 * 清空得分
 */
export async function clearScore(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    // 判断队伍是否存在
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    // 判断活动是否存在
    const event = await prisma.event.findUnique({
      where: {
        id: team.eventId,
      },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (!req.user) {
      return ResponseUtils.error(res, 401, '未认证');
    }
    // 清空得分
    await prisma.score.deleteMany({
      where: {
        teamId,
        eventId: team.eventId,
      },
    });
    return ResponseUtils.success(res, 200, '清空得分成功', null);
  } catch (err) {
    console.error('清空得分失败:', err);
    return ResponseUtils.serverError(res, '清空得分失败');
  }
}

/**
 * 删除得分
 */
export async function removeScoreById(req: Request, res: Response) {
  try {
    const scoreId = Number(req.params.scoreId);
    if (!scoreId) {
      return ResponseUtils.error(res, 400, '得分ID是必填的');
    }
    // 判断得分是否存在
    const score = await prisma.score.findUnique({
      where: {
        id: scoreId,
      },
    });
    if (!score) {
      return ResponseUtils.error(res, 404, '得分不存在');
    }
    // 判断活动是否存在
    const event = await prisma.event.findUnique({
      where: {
        id: score.eventId,
      },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    if (!req.user) {
      return ResponseUtils.error(res, 401, '未认证');
    }
    // 删除得分
    await prisma.score.delete({
      where: {
        id: scoreId,
      },
    });
    return ResponseUtils.success(res, 200, '删除得分成功', null);
  } catch (err) {
    console.error('删除得分失败:', err);
    if ((err as any)?.code === 'P2003') {
      return ResponseUtils.error(res, 400, '该得分存在关联数据，无法删除');
    }
    return ResponseUtils.serverError(res, '删除得分失败');
  }
}
