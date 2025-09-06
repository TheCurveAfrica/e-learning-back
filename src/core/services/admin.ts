import { AdminRepository } from '../repositories/AdminRepository';
import { IAdmin } from '../interfaces/auth';
import { FilterQuery } from 'mongoose';
import { IAdminModel } from '../models/admin';
import { addSeconds, isAfter } from 'date-fns';
import settings from '../config/application';
import * as redisClient from '../utils/redis';
import { generateRandomInteger } from '../helpers/utilities';

class AdminService {
  private adminRepository: AdminRepository;

  constructor(_adminRepository: AdminRepository) {
    this.adminRepository = _adminRepository;
  }

  async createAdmin(payload: Omit<IAdmin, '_id'>): Promise<IAdmin> {
    return await this.adminRepository.createAdmin(payload);
  }

  async getAdmin(filter: FilterQuery<IAdminModel>): Promise<IAdmin | null> {
    return await this.adminRepository.getAdmin(filter);
  }

  async findAllAdmins(filter?: FilterQuery<IAdminModel>): Promise<IAdmin[]> {
    return await this.adminRepository.findAllAdmins(filter);
  }

  async updateAdmin(filter: FilterQuery<IAdminModel>, payload: Partial<Omit<IAdmin, '_id'>>): Promise<IAdminModel | null> {
    return await this.adminRepository.updateAdmin(filter, payload);
  }

  async deleteAdmin(filter: FilterQuery<IAdminModel>): Promise<{ deletedCount: number }> {
    return await this.adminRepository.deleteAdmin(filter);
  }

  // OTP/Redis password reset logic
  async cachePasswordResetDetails(email: string): Promise<{ resetPasswordCode: string; expiryDate: Date }> {
    const resetPasswordCode = generateRandomInteger(6).toString();
    const resetPasswordLinkExpiryInSeconds = Number(settings.reset_password?.reset_link_validity_duration || 600);
    const resetPasswordLinkCacheKey = `ADMIN_PASSWORD_RESET:${email}`;
    const expiryDate = addSeconds(new Date(), resetPasswordLinkExpiryInSeconds);
    const resetData = JSON.stringify({ resetPasswordCode, expiryDate });
    await redisClient.set(resetPasswordLinkCacheKey, resetData, resetPasswordLinkExpiryInSeconds);
    return { resetPasswordCode, expiryDate };
  }

  async isPasswordResetTokenValid(email: string, code: string): Promise<boolean> {
    const resetPasswordCacheKey = `ADMIN_PASSWORD_RESET:${email}`;
    const cachedData = await redisClient.get(resetPasswordCacheKey);
    if (!cachedData) return false;
    const { resetPasswordCode, expiryDate } = JSON.parse(cachedData);
    if (resetPasswordCode !== code) {
      return false;
    }
    if (isAfter(new Date(), new Date(expiryDate))) {
      await redisClient.del(resetPasswordCacheKey);
      return false;
    }
    return true;
  }

  async clearCachedPasswordResetToken(email: string): Promise<void> {
    const resetLinkCacheKey = `ADMIN_PASSWORD_RESET:${email}`;
    await redisClient.del(resetLinkCacheKey);
  }
}

export default AdminService;
