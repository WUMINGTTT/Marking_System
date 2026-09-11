import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '../utils/jwt';
import { ResponseUtils } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; username: string };
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  // 从请求头中取出 token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseUtils.error(res, 401, '无认证令牌，请登录后访问');
  }
  const token = authHeader.split(' ')[1];

  // 校验 token
  const result = JwtUtils.verifyToken(token);
  if (!result.success) {
    if (result.error.name === 'TokenExpiredError') {
      return ResponseUtils.error(res, 401, '认证令牌过期，请重新登录');
    } else if (result.error.name === 'JsonWebTokenError') {
      return ResponseUtils.error(res, 401, '认证令牌无效，请重新登录');
    } else {
      return ResponseUtils.error(res, 401, '未知错误，请联系管理员');
    }
  }
  const payload = result.tokenPayload;

  // 校验通过，将用户信息挂到 req 上
  req.user = payload;
  next();
}
