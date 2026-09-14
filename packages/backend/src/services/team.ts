import prisma from '../lib/prisma';
import { TeamInfo } from 'shared';
import { ResponseUtils } from '../utils/response';
import { Request, Response } from 'express';

/**
 * 创建队伍
 */
export async function createTeam(req: Request, res: Response) {
  try {
    const name: string = req.body.name;
    const eventId = Number(req.params.eventId);
    if (!eventId) {
      return ResponseUtils.error(res, 400, '活动ID是必填的');
    }
    if (!name) {
      return ResponseUtils.error(res, 400, '队伍名称是必填的');
    }
    if (name.length > 100) {
      return ResponseUtils.error(res, 400, '队伍名称最多100个字符');
    }
    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return ResponseUtils.error(res, 404, '活动不存在');
    }
    // 检查同一活动中的队伍名称是否已存在
    const existingTeam = await prisma.team.findUnique({
      where: { eventId_name: { eventId, name: name.toString() } },
    });
    if (existingTeam) {
      return ResponseUtils.error(res, 400, '队伍名称已存在');
    }
    const team: TeamInfo = await prisma.team.create({
      data: { name: name.toString(), eventId },
    });
    ResponseUtils.success(res, 201, '创建队伍成功', team);
  } catch (err) {
    console.error('创建队伍失败:', err);
    ResponseUtils.serverError(res, '创建队伍失败');
  }
}

/**
 * 获取队伍列表
 */
export async function getTeams(req: Request, res: Response) {
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
    const teams: TeamInfo[] = await prisma.team.findMany({
      where: { eventId },
    });
    ResponseUtils.success(res, 200, '获取队伍列表成功', teams);
  } catch (err) {
    console.error('获取队伍列表失败:', err);
    ResponseUtils.serverError(res, '获取队伍列表失败');
  }
}

/**
 * 获取队伍详情
 */
export async function getTeamById(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        scores: true,
      },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    ResponseUtils.success(res, 200, '获取队伍成功', team);
  } catch (err) {
    console.error('获取队伍失败:', err);
    ResponseUtils.serverError(res, '获取队伍失败');
  }
}

/**
 * 更新队伍
 */
export async function updateTeam(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    const name: string = req.body.name;
    if (!name) {
      return ResponseUtils.error(res, 400, '队伍名称是必填的');
    }
    if (name.length > 100) {
      return ResponseUtils.error(res, 400, '队伍名称最多100个字符');
    }
    // 检查队伍是否存在
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    const updatedTeam: TeamInfo = await prisma.team.update({
      where: { id: teamId },
      data: { name: name.toString() },
    });
    ResponseUtils.success(res, 200, '更新队伍成功', updatedTeam);
  } catch (err) {
    console.error('更新队伍失败:', err);
    ResponseUtils.serverError(res, '更新队伍失败');
  }
}

/**
 * 删除队伍
 */
export async function deleteTeam(req: Request, res: Response) {
  try {
    const teamId = Number(req.params.teamId);
    if (!teamId) {
      return ResponseUtils.error(res, 400, '队伍ID是必填的');
    }
    // 检查队伍是否存在
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      return ResponseUtils.error(res, 404, '队伍不存在');
    }
    await prisma.team.delete({
      where: { id: teamId },
    });
    ResponseUtils.success(res, 200, '删除队伍成功', null);
  } catch (err) {
    console.error('删除队伍失败:', err);
    ResponseUtils.serverError(res, '删除队伍失败');
  }
}
