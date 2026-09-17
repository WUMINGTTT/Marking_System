import request from '@/utils/request';
import type { UserRegister, UserInfo, UserLogin, ChangePassword } from 'shared';

/**
 * 注册用户
 * @param data 请求参数
 */
export async function register(data: UserRegister) {
  return request.post<UserRegister>('/api/users/register', data);
}

/**
 * 登录用户
 * @param data 请求参数
 */
export async function login(data: UserLogin) {
  return request.post<UserLogin>('/api/users/login', data);
}

/**
 * 删除用户/注销账号（仅删除自己）
 */
export async function deleteUser() {
  return request.delete('/api/users');
}

/**
 * 获取用户列表
 */
export async function getUserList() {
  return request.get<UserInfo[]>('/api/users');
}

/**
 * 获取单个用户
 * @param userId 用户id
 */
export async function getUser(userId: number) {
  return request.get<UserInfo>(`/api/users/${userId}`);
}

/**
 * 修改密码
 */
export async function changePassword() {
  return request.put<ChangePassword>('/api/users/password');
}

/**
 * 修改昵称
 */
export async function changeName() {
  return request.put<{ newName: string }>('/api/users/name');
}
