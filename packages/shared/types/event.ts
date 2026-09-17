/**
 * 活动详情信息
 * @param id 活动ID
 * @param name 活动名称
 * @param description 活动描述
 * @param creatorId 创建者
 * @param status 活动状态 pending | active | finished
 * @param createdAt 创建时间
 */
export interface EventInfo {
  id: number;
  name: string;
  description: string | null;
  creatorId: number;
  status: string; //'pending' | 'active' | 'finished'
  createdAt: Date;
}

/**
 * 创建活动参数
 * @param name 活动名称
 * @param description 活动描述
 */
export interface EventCreate {
  name: string;
  description: string | null;
}

/**
 * 更新活动参数
 *
 */
export interface UpdateEvent {
  name?: string | null;
  description?: string | null;
  status?: string; //'pending' | 'active' | 'finished'
}
