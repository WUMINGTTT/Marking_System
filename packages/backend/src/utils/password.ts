import bcrypt from 'bcryptjs';

/**
 * 密码加密工具类
 */
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 10;

  /**
   * 异步密码加密
   * @param plainPassword - 明文密码
   */
  static async hashPassword(plainPassword: string): Promise<string> {
    if (!plainPassword) {
      throw new Error('密码不能为空');
    }
    try {
      const salt = await bcrypt.genSalt(PasswordUtils.SALT_ROUNDS);
      return bcrypt.hash(plainPassword, salt);
    } catch (error) {
      throw new Error('密码加密失败');
    }
  }

  /**
   * 异步密码验证
   * @param plainPassword - 明文密码
   * @param hashedPassword - 已加密的密码
   */
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword) {
      throw new Error('密码和已加密的密码都不能为空');
    }
    try {
      return bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('密码验证失败');
    }
  }

  /**
   * 同步密码加密
   * @param plainPassword
   */
  static hashPasswordSync(plainPassword: string): string {
    if (!plainPassword) {
      throw new Error('密码不能为空');
    }
    try {
      const salt = bcrypt.genSaltSync(this.SALT_ROUNDS);
      return bcrypt.hashSync(plainPassword, salt);
    } catch (err) {
      throw new Error('密码加密失败');
    }
  }

  /**
   * 同步密码验证
   * @param plainPassword
   * @param hashPassword
   */
  static compareSync(plainPassword: string, hashedPassword: string) : boolean {
    if (!plainPassword || !hashedPassword) {
      throw new Error('密码和已加密的密码都不能为空');
    }
    try { 
      return bcrypt.compareSync(plainPassword, hashedPassword)
    } catch(err) {
      throw new Error('密码验证失败')
    }
  }
}
