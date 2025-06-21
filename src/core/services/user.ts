import { IUserRepository } from '../interfaces/repository/IUserRepository';
import { IUser } from '../interfaces/auth';
import { FilterQuery } from 'mongoose';
import { IUserModel } from '../models/user';
import { addSeconds, isAfter } from 'date-fns';
import settings from '../config/application';
import TooManyRequestsError from '../errors/TooManyRequestsError';
import redisClient from '../utils/redis';
import { generateRandomInteger } from '../helpers/utilities';

class UserService {
  private userRepository: IUserRepository;

  constructor(_userRepository: IUserRepository) {
    this.userRepository = _userRepository;
  }

  async createUser(payload: Omit<IUser, '_id'>): Promise<IUser> {
    return await this.userRepository.createUser(payload);
  }

  async findOrCreate(payload: Omit<IUser, '_id'>, filter: FilterQuery<IUserModel>): Promise<IUser> {
    const { user } = await this.userRepository.findOrCreateUser(filter, payload);
    return user;
  }

  async getUser(filter: FilterQuery<IUserModel>): Promise<IUser | null> {
    return await this.userRepository.getUser(filter);
  }

  async findUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findUserById(id);
  }

  async findAllUsers(filter?: FilterQuery<IUserModel>): Promise<IUser[]> {
    return await this.userRepository.findAllUsers(filter);
  }

  async updateUser(payload: Partial<Omit<IUser, '_id'>>, filter: FilterQuery<IUserModel>): Promise<{ modifiedCount: number }> {
    return await this.userRepository.updateUser(filter, payload);
  }

  async delete(filter: FilterQuery<IUserModel>): Promise<{ deletedCount: number }> {
    return await this.userRepository.deleteUser(filter);
  }

  async bulkCreateUsers(users: Omit<IUser, '_id'>[]): Promise<IUser[]> {
    return await this.userRepository.bulkCreateUsers(users);
  }

  async getUserWithRoleName(filter: FilterQuery<IUserModel>): Promise<IUser | null> {
    // This would need to be implemented in the repository if it requires special joins/aggregations
    return await this.userRepository.getUser(filter);
  }

  async cacheEmailVerificationDetail(params: {
    email: string;
    studentResend?: boolean;
  }): Promise<{ verificationLink: string; verificationLinkExpiry: Date }> {
    const verificationCode = generateRandomInteger(6).toString();
    const verificationLink =
      `${settings.app_base_url}${settings.email.verification_url}` + `?verification_token=${verificationCode}&email=${params.email}`;
    const verificationLinkExpiryInSeconds = Number(settings.customer_email_verification.link_validity_duration);
    const verificationLinkCacheKey = `STUDENT_VERIFICATION_LINK:${params.email}`;
    const verificationResendCountCacheKey = `STUDENT_VERIFICATION_RESEND_COUNT:${params.email}`;

    if (params.studentResend) {
      const updatedResendCount = await redisClient.incr(verificationResendCountCacheKey);
      if (updatedResendCount > settings.customer_email_verification.resend_limit) {
        throw new TooManyRequestsError({ message: 'You have reached the maximum number of resend attempts. Please try again later' });
      }

      redisClient.expire(verificationResendCountCacheKey, 3600);
    }

    const expiryDate = addSeconds(new Date(), verificationLinkExpiryInSeconds);
    const verificationData = JSON.stringify({ verificationCode, expiryDate });

    await redisClient.set(verificationLinkCacheKey, verificationData, { EX: verificationLinkExpiryInSeconds });

    return { verificationLink, verificationLinkExpiry: expiryDate };
  }

  async isVerificationCodeValid(email: string, code: string): Promise<boolean> {
    const verificationLinkCacheKey = `STUDENT_VERIFICATION_LINK:${email}`;
    const cachedData = await redisClient.get(verificationLinkCacheKey);
    if (!cachedData) return false;

    const { verificationCode, expiryDate } = JSON.parse(cachedData);
    if (verificationCode !== code) {
      return false;
    }

    if (isAfter(new Date(), new Date(expiryDate))) {
      redisClient.del(verificationLinkCacheKey);
    }

    return true;
  }

  async clearCachedVerificationCode(email: string): Promise<void> {
    const verificationLinkCacheKey = `STUDENT_VERIFICATION_LINK:${email}`;
    const verificationResendCountCacheKey = `STUDENT_VERIFICATION_RESEND_COUNT:${email}`;

    await Promise.all([redisClient.del(verificationLinkCacheKey), redisClient.del(verificationResendCountCacheKey)]);
  }

  async cacheRefreshToken(data: { userId: string; refreshToken: string }): Promise<void> {
    const refreshTokenCacheKey = `USER_REFRESH_TOKEN:${data.userId}`;
    const refreshTokenExpiryInSeconds = Number(settings.jwt.refresh_token_expires_in);
    const refreshTokenData = JSON.stringify({ token: data.refreshToken });
    await redisClient.set(refreshTokenCacheKey, refreshTokenData, { EX: refreshTokenExpiryInSeconds });
    redisClient.expire(refreshTokenCacheKey, refreshTokenExpiryInSeconds);
  }

  async isRefreshTokenValid(data: { userId: string; refreshToken: string }): Promise<boolean> {
    const refreshTokenCacheKey = `USER_REFRESH_TOKEN:${data.userId}`;
    const cachedData = await redisClient.get(refreshTokenCacheKey);
    if (!cachedData) return false;

    const { token } = JSON.parse(cachedData);
    if (token !== data.refreshToken) {
      return false;
    }

    return true;
  }

  async clearCachedToken(userId: string): Promise<void> {
    const accessTokenCacheKey = `USER_ACCESS_TOKEN:${userId}`;
    const refreshTokenCacheKey = `USER_REFRESH_TOKEN:${userId}`;
    await redisClient.del(refreshTokenCacheKey);
    await redisClient.del(accessTokenCacheKey);
  }

  async cachePasswordResetDetails(email: string): Promise<{ resetPasswordLink: string; resetPasswordLinkExpiry: Date }> {
    const resetPasswordCode = generateRandomInteger(7);
    const resetPasswordLink = `${settings.app_base_url}${settings.reset_password.reset_url}?reset_code=${resetPasswordCode}&email=${email}`;
    const resetPasswordLinkExpiryInSeconds = Number(settings.reset_password.reset_link_validity_duration);
    const resetPasswordLinkCacheKey = `PASSWORD_RESET:${email}`;

    const expiryDate = addSeconds(new Date(), resetPasswordLinkExpiryInSeconds);
    const resetData = JSON.stringify({ resetPasswordCode, expiryDate });

    await redisClient.set(resetPasswordLinkCacheKey, resetData, { EX: resetPasswordLinkExpiryInSeconds });

    return { resetPasswordLink, resetPasswordLinkExpiry: expiryDate };
  }

  async isPasswordResetTokenValid(email: string, code: string): Promise<boolean> {
    const resetPasswordCacheKey = `PASSWORD_RESET:${email}`;
    const cachedData = await redisClient.get(resetPasswordCacheKey);
    if (!cachedData) return false;

    const { resetPasswordCode, expiryDate } = JSON.parse(cachedData);
    if (resetPasswordCode !== Number(code)) {
      return false;
    }

    if (isAfter(new Date(), new Date(expiryDate))) {
      redisClient.del(resetPasswordCacheKey);
    }

    return true;
  }

  async clearCachedPasswordResetToken(email: string): Promise<void> {
    const resetLinkCacheKey = `PASSWORD_RESET:${email}`;
    await redisClient.del(resetLinkCacheKey);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.findAllUsers();
  }
}

export default UserService;
