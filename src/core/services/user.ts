import { IUserRepository } from '../interfaces/repository/IUserRepository';
import { IUser } from '../interfaces/auth';
import { FilterQuery } from 'mongoose';
import { IUserModel } from '../models/user';
import { addSeconds, isAfter } from 'date-fns';
import settings from '../config/application';
import TooManyRequestsError from '../errors/TooManyRequestsError';
import redisClient from '../utils/redis';
import { generateRandomInteger } from '../helpers/utilities';
import { bulkRegistrationSchema } from '../validations/user';
import { EMAIL_STATUS, USER_STATUS } from '../constants/user';
import * as XLSX from 'xlsx';
import BadRequestError from '../errors/BadRequestError';
import { USER_ROLES } from '../constants/user';

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

  async updateUser(payload: Partial<Omit<IUser, '_id'>>, filter: FilterQuery<IUserModel>): Promise<IUserModel | null> {
    return await this.userRepository.updateUser(filter, payload);
  }

  async delete(filter: FilterQuery<IUserModel>): Promise<{ deletedCount: number }> {
    return await this.userRepository.deleteUser(filter);
  }

  async bulkCreateUsers(users: Omit<IUser, '_id'>[]): Promise<IUser[]> {
    return await this.userRepository.bulkCreateUsers(users);
  }

  async bulkCreateUsersFromExcel(fileBuffer: Buffer): Promise<{ created: IUser[]; duplicates: string[]; invalidRows: any[] }> {
    if (!fileBuffer) throw new BadRequestError({ message: 'Excel file is required' });
    const rawRows = this.extractRows(fileBuffer);
    if (!rawRows.length) throw new BadRequestError({ message: 'No rows found in sheet' });

    const { formattedUsers, invalidRows, invalidSet } = this.normalizeRows(rawRows);

    if (!formattedUsers.length) throw new BadRequestError({ message: 'No valid rows found in sheet' });

    let validUsers: any[] = [];
    console.log(validUsers);
    const parseResult = bulkRegistrationSchema.safeParse(formattedUsers);

    if (parseResult.success) {
      validUsers = parseResult.data;
      console.log('✅ Valid users:', validUsers.length);
    } else {
      console.log('❌ Zod validation failed:', parseResult.error.errors);

      for (const issue of parseResult.error.errors) {
        const index = typeof issue.path[0] === 'number' ? issue.path[0] : -1;
        const row = formattedUsers[index];
        if (row?.email && !invalidSet.has(row.email)) {
          invalidRows.push({
            ...row,
            reason: issue.message
          });
          invalidSet.add(row.email);
        }
      }

      // if (invalidRows.length) {
      //   if (invalidRows.length === formattedUsers.length) {
      //     throw new BadRequestError({ message: 'No valid rows found in sheet' });
      //   } else {
      //     console.log('❌ Invalid rows found:', invalidRows.length);

      const invalidEmails = new Set(invalidRows.map((u) => u.email));
      validUsers = formattedUsers.filter((u) => !invalidEmails.has(u.email));
    }

    const emails = validUsers.map((user) => user.email);
    const existingUsers = await this.userRepository.findAllUsers({ email: { $in: emails } });
    const existingEmails = new Set(existingUsers.map((user) => user.email));

    const newUsers = validUsers.filter((user) => !existingEmails.has(user.email));
    const duplicates = validUsers.filter((user) => existingEmails.has(user.email)).map((user) => user.email);

    const created = newUsers.length ? await this.userRepository.bulkCreateUsers(newUsers as Omit<IUser, '_id'>[]) : [];

    return { created, duplicates, invalidRows };
  }

  private extractRows(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  private normalizeRows(rawRows: any[]): { formattedUsers: any[]; invalidRows: any[]; invalidSet: Set<string> } {
    const formattedUsers: any[] = [];
    const invalidRows: any[] = [];
    const invalidSet = new Set<string>();

    for (const row of rawRows) {
      const normalized: Record<string, any> = {};
      for (const key in row) {
        normalized[key.toLowerCase().trim()] = row[key];
      }

      const email = normalized['email']?.toLowerCase().trim() || normalized['email address']?.toLowerCase().trim() || '';
      const firstName = normalized['firstname'] || normalized['first name'] || '';
      const lastName = normalized['lastname'] || normalized['last name'] || '';
      console.log(normalized['phone']);
      const phone = normalized['phone']?.toString() || normalized['phone number']?.toString() || normalized['phonenumber']?.toString() || ' ';
      const gender = normalized['gender']?.toLowerCase() || '';
      const stack = normalized['stack']?.toLowerCase() || '';

      if (!email || !firstName || !lastName || !gender || !stack) {
        if (email && !invalidSet.has(email)) {
          invalidRows.push(row);
          invalidSet.add(email);
        }
        continue;
      }

      formattedUsers.push({
        email,
        firstname: firstName,
        lastname: lastName,
        phone: phone || ' ',
        gender,
        stack,
        password: ' ',
        isEmailVerified: EMAIL_STATUS.NOT_VERIFIED,
        status: USER_STATUS.Inactive,
        role: USER_ROLES.STUDENT
      });
    }

    return { formattedUsers, invalidRows, invalidSet };
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
    const resetPasswordCode = generateRandomInteger(6).toString();
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

    if (resetPasswordCode !== code) {
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
}

export default UserService;
