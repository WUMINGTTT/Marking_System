/**
 * 队伍详情信息
 * @param id 队伍ID
 * @param eventId 所在活动ID
 * @param name 队伍名称
 * @param createdAt 创建时间
 */
export interface TeamInfo {
  id: number;
  eventId: number;
  name: string;
  createdAt: Date;
}
