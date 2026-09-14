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
 * 查询队伍的评分值列表（Decimal 转 number）
 * @returns 分数值数组；队伍不存在时返回 null
 */
async function getTeamScoreValues(teamId: number): Promise<number[] | null> {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return null;
  const scores = await prisma.score.findMany({
    where: { teamId, eventId: team.eventId },
    select: { value: true },
  });
  return scores.map((s) => Number(s.value));
}

/**
 * 获取队伍平均分与去高低分后的平均分
 * 评分不足3个时去高低分后的平均分退化为普通平均分
 */
export async function getAverageScore(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    const values = await getTeamScoreValues(teamId);
    if (!values) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    if (values.length === 0) {
      return ResponseUtils.success(res, 200, '暂无评分', {
        average: null,
        trimmedAverage: null,
        count: 0,
        excludedCount: 0,
      });
    }

    // 普通平均分
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;

    // 去最高最低分后的平均分：至少3个评分才去掉首尾
    const counted =
      values.length >= 3
        ? [...values].sort((a, b) => a - b).slice(1, -1)
        : values;
    const trimmedAverage =
      counted.reduce((sum, v) => sum + v, 0) / counted.length;

    return ResponseUtils.success(res, 200, '获取平均分成功', {
      average: Number(average.toFixed(2)),
      trimmedAverage: Number(trimmedAverage.toFixed(2)),
      count: values.length,
      excludedCount: values.length - counted.length,
    });
  } catch (err) {
    console.error('获取平均分失败:', err);
    return ResponseUtils.serverError(res, '获取平均分失败');
  }
}

/**
 * 获取所有队伍平均分
 */
export async function getAllAverageScore(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId) {
      return ResponseUtils.error(res, 400, '活动ID是必填的');
    }

    // 判断活动是否存在
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }

    const teams = await prisma.team.findMany({
      where: { eventId },
      include: { scores: { select: { value: true } } },
      orderBy: { id: 'asc' },
    });

    const result = teams.map((team) => {
      const values = team.scores.map((s) => Number(s.value));
      const count = values.length;
      if (count === 0) {
        return {
          teamId: team.id,
          teamName: team.name,
          average: null,
          trimmedAverage: null,
          count: 0,
          excludedCount: 0,
        };
      }

      const average = values.reduce((sum, v) => sum + v, 0) / count;

      const counted =
        count >= 3 ? [...values].sort((a, b) => a - b).slice(1, -1) : values;
      const trimmedAverage =
        counted.reduce((sum, v) => sum + v, 0) / counted.length;

      return {
        teamId: team.id,
        teamName: team.name,
        average: Number(average.toFixed(2)),
        trimmedAverage: Number(trimmedAverage.toFixed(2)),
        count,
        excludedCount: count - counted.length,
      };
    });

    return ResponseUtils.success(res, 200, '获取全部平均分成功', result);
  } catch (err) {
    console.error('获取全部平均分失败:', err);
    return ResponseUtils.serverError(res, '获取全部平均分失败');
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
