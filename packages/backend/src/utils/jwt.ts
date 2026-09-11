import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  '2g2g42gfwa1lknggjsfaLwgfKN2426awfL5sfJQN3aawf2la4nq6l424642314k52j2N4J2fn32524ksfsj2';
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 24 * 60 * 60; // 1天

interface TokenPayload {
  userId: number;
  username: string;
}
interface JWTReturn {
  success: boolean;
  error?: any;
  tokenPayload?: TokenPayload;
}

/**
 * token 工具类
 */
export class JwtUtils {
  /**
   * 签发 token
   * @param payload token 有效载荷
   * @returns 签发的 token
   */
  static signToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * 校验 token
   * @param token 要校验的 token
   * @returns 校验通过的 token 有效载荷
   */
  static verifyToken(token: string): JWTReturn {
    try {
      return {
        success: true,
        tokenPayload: jwt.verify(token, JWT_SECRET) as TokenPayload,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err,
      };
    }
  }
}
