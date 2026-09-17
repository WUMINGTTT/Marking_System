import request from '@/utils/request';

/**
 * 创建队伍
 */
export async function createTeam(eventId: number, data: { name: string }) {
  return request.post(`/api/teams/${eventId}`, data);
}

/**
 * 获取队伍列表
 * @param eventId 活动id
 */
export async function getTeamList(eventId: number) {
  return request.get(`/api/teams/getall/${eventId}`);
}

/**
 * 获取单个队伍
 * @param teamId 队伍id
 */
export async function getTeambyId(teamId: number) {
  return request.get(`/api/teams/${teamId}`);
}

/**
 * 更新队伍
 * @param teamId 队伍id
 */
export async function update(teamId: number) {
  return request.put(`/api/teams/${teamId}`);
}

/**
 * 删除队伍
 * @param teamId 队伍id
 */
export async function deleteTeam(teamId: number) {
  return request.delete(`/api/teams/${teamId}`);
}
