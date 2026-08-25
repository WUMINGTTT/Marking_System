/**
 * 注册请求参数
 * @param username 用户名
 * @param password 密码
 * @param name 显示名称
 */
export interface UserRegister {
  username: string;
  password: string;
  name: string;
}

/**
 * 登录请求参数
 * @param username 用户名
 * @param password 密码
 */
export interface UserLogin {
  username: string;
  password: string;
}

/**
 * 用户详情信息
 * @param id 用户id
 * @param username 用户名
 * @param name 显示名称
 * @param createdAt 创建时间
 */
export interface UserInfo {
  id: number;
  username: string;
  name: string;
  createdAt: Date;
}

/**
 * 修改密码请求参数
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 */
export interface changePassword {
  oldPassword: string;
  newPassword: string;
}
