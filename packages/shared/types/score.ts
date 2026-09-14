/**
 *得分详情信息
 * @param id 得分ID
 * @param eventId 活动ID
 * @param teamId 队伍ID
 * @param judgeId 评委ID
 * @param value 得分值
 * @param createdAt 创建时间
 */
export interface ScoreInfo {
  id: number;
  eventId: number;
  teamId: number;
  judgeId: number;
  value: number;
  createdAt: Date;
}
