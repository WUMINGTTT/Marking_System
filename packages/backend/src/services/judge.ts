import prisma from '../lib/prisma';
import { JudgeInfo } from 'shared';
import { ResponseUtils } from '../utils/response';
import { Request, Response } from 'express';

/**
 * 创建评委
 */
export async function addJudge(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.body.judgeId);
    if (!eventId || !userId) {
      return ResponseUtils.error(res, 400, '活动ID和评委ID是必填的');
    }
    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    // 检查评委是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return ResponseUtils.error(res, 404, '用户不存在');
    }
    // 检查活动是否已存在该评委
    const judge = await prisma.eventJudge.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (judge) {
      return ResponseUtils.error(res, 400, '活动已存在该评委');
    }
    const newJudge = await prisma.eventJudge.create({
      data: { eventId, userId },
    });
    return ResponseUtils.success(res, 201, '创建评委成功', newJudge);
  } catch (err) {
    console.error('创建评委失败:', err);
    return ResponseUtils.serverError(res, '创建评委失败');
  }
}

/**
 * 获取评委列表
 */
export async function getJudges(req: Request, res: Response) {
  try {
    const eventId = Number(req.params.eventId);
    if (!eventId) {
      return ResponseUtils.error(res, 400, '活动ID是必填的');
    }
    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    const judges: JudgeInfo[] = await prisma.eventJudge.findMany({
      where: { eventId },
    });
    return ResponseUtils.success(res, 200, '获取评委列表成功', judges);
  } catch (err) {
    console.error('获取评委列表失败:', err);
    return ResponseUtils.serverError(res, '获取评委列表失败');
  }
}

/**
 * 删除评委
 */
export async function removeJudge(req: Request, res: Response) {
  try {
    const judgeId = Number(req.params.judgeId);
    if (!judgeId) {
      return ResponseUtils.error(res, 400, '评委ID是必填的');
    }
    const judge = await prisma.eventJudge.findUnique({
      where: { id: judgeId },
    });
    if (!judge) {
      return ResponseUtils.error(res, 404, '评委不存在');
    }
    await prisma.eventJudge.delete({
      where: { id: judgeId },
    });
    return ResponseUtils.success(res, 200, '删除评委成功', null);
  } catch (err) {
    console.error('删除评委失败:', err);
    if ((err as any)?.code === 'P2003') {
      return ResponseUtils.error(res, 400, '该评委存在关联数据，无法删除');
    }
    return ResponseUtils.serverError(res, '删除评委失败');
  }
}
