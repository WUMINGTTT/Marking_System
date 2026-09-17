import request from '@/utils/request';

/**
 * 添加评委
 * @param eventId 活动id
 * @param data 请求参数
 */
export async function addJuege(eventId: number, data: { judgeId: number }) {
  return request.post(`/api/judges/${eventId}`, data);
}

/**
 * 获取评委列表
 * @param eventId 活动id
 */
export async function getJudgeList(eventId: number) {
  return request.get(`/api/judges/${eventId}`);
}

/**
 * 移除评委
 * @param judgeId 评委Id
 */
export async function removeJudge(judgeId: number) {
  return request.delete(`/api/judges/${judgeId}`);
}
