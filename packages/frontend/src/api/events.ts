import request from '@/utils/request';
import type { EventInfo, EventCreate, UpdateEvent } from 'shared';

/**
 * 创建活动
 * @param data 请求参数
 */
export async function createEvent(data: EventCreate) {
  return request.post<EventCreate>('/api/events', data);
}

/**
 * 获取活动列表
 */
export async function getEventList() {
  return request.get<EventInfo[]>('/api/events');
}

/**
 * 获取活动列表（含全部关联数据）
 */
export async function getAll() {
  return request.get('/api/events/all');
}

/**
 * 获取单个活动
 * @param eventId 活动id
 */
export async function getEvent(eventId: number) {
  return request.get<EventInfo>(`/api/events/getbyid/${eventId}}`);
}

/**
 * 更新活动信息
 * @param eventId 活动id
 * @param data 请求参数
 */
export async function updateEvent(eventId: number, data: UpdateEvent) {
  return request.put(`/api/events/${eventId}`, data);
}

/**
 * 删除活动
 * @param eventId 活动id
 */
export async function deleteEvent(eventId: number) {
  return request.delete(`/api/events/${eventId}`);
}

/**
 * 获取用户在活动中的身份
 * @param eventId 活动id
 */
export async function getMyRole(eventId: number) {
  return request.get(`/api/events/my-role/${eventId}`);
}
