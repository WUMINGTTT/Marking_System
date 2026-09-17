import request from '@/utils/request';

/**
 * 创建得分
 * @param teamId 队伍id
 */
export async function createScore(teamId: number) {
  return request.post(`/api/scores/${teamId}`);
}

/**
 * 获取得分列表
 * @param teamId 队伍id
 */
export async function getScoresList(teamId: number) {
  return request.get(`/api/scores/${teamId}`);
}
/**
 * 更新得分（仅更新自己对目标队伍的得分）
 * @param teamId 队伍id
 */
export async function updateScore(teamId: number) {
  return request.put(`/api/scores/${teamId}`);
}

/**
 * 获取队伍平均分
 * @param teamId 队伍id
 */
export async function getaverage(teamId: number) {
  return request.get(`/api/scores/getaverage/${teamId}}`);
}

/**
 * 获取活动所有队伍的平均分
 * @param eventId 活动id
 */
export async function getAllAverage(eventId: number) {
  return request.get(`/api/scores/getallaverage/${eventId}`);
}

/**
 * 清空队伍得分
 * @param teamId 队伍id
 */
export async function clearTeamScore(teamId: number) {
  return request.get(`/api/scores/clearall/${teamId}`);
}

/**
 * 删除单条得分
 * @param scoreId 得分id
 */
export async function removeCcore(scoreId: number) {
  return request.delete(`/api/scores/${scoreId}`);
}
