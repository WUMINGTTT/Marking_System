import { Response } from 'express';

/**
 * 统一响应数据结构
 */
interface ApiResponse<T = unknown> {
  code: boolean;
  message: string;
  data: T | null;
}

/**
 * 发送成功响应
 */
export function success<T>(
  res: Response,
  statusCode = 200,
  message = '操作成功',
  data: T
): void {
  const response: ApiResponse<T> = {
    code: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

/**
 * 发送错误响应
 */
export function error(
  res: Response,
  statusCode = 400,
  message = '操作失败',
  data = null
): void {
  const response: ApiResponse<null> = {
    code: false,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

/**
 * 发送服务器内部错误响应
 */
export function serverError(res: Response, message = '服务器内部错误'): void {
  error(res, 500, message);
}
