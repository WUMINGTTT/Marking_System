/**
 * 评委详情信息
 * @param id 评委ID
 * @param eventId 活动ID
 * @param userId 用户ID
 * @param createdAt 创建时间
 */
export interface JudgeInfo {
  id: number;
  eventId: number;
  userId: number;
  createdAt: Date;
}
