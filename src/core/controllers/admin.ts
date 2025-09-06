import bcrypt from 'bcrypt';
import BadRequestError from '../errors/BadRequestError';
import { IAdmin } from '../interfaces/auth';
import { AdminRepository } from '../repositories/AdminRepository';
import { generateAlphanumericString, capitalizeFirstLetter } from '../helpers/utilities';
import EmailService from '../services/email';
import AdminService from '../services/admin';
import { generateAccessJwtToken, generateRefreshJwtToken } from '../helpers/auth';
import * as redisClient from '../utils/redis';
import settings from '../config/application';
import { logger } from '../utils/logger';

class AdminController {
  private adminRepository: AdminRepository;
  private adminService: AdminService;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.adminService = new AdminService(this.adminRepository);
  }

  async register(body: Omit<IAdmin, '_id'>): Promise<Omit<IAdmin, 'password'>> {
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.getAdmin({ email: body.email });
    if (existingAdmin) {
      throw new BadRequestError({ message: 'Admin already exists', reason: 'Admin already registered' });
    }

    // Capitalize names
    body.firstname = capitalizeFirstLetter(body.firstname);
    body.lastname = capitalizeFirstLetter(body.lastname);

    // Generate password if not provided
    let plainPassword = body.password;
    if (!plainPassword) {
      plainPassword = generateAlphanumericString(12);
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    // Create admin
    const newAdmin = await this.adminRepository.createAdmin({
      ...body,
      password: hashedPassword
    });

    // Send password to email if it was generated
    if (!body.password) {
      await EmailService.sendAdminPasswordEmail({
        to: newAdmin.email,
        name: newAdmin.firstname,
        password: plainPassword
      });
    }

    // Return admin data without password
    const { password, ...adminData } = newAdmin;
    return adminData;
  }

  async login(body: { email: string; password: string }): Promise<{ admin: Omit<IAdmin, 'password'>; accessToken: string; refreshToken: string }> {
    const admin = await this.adminRepository.getAdmin({ email: body.email });
    if (!admin) {
      throw new BadRequestError({ message: 'Invalid email or password' });
    }
    const passwordCorrect = bcrypt.compareSync(body.password, admin.password);
    if (!passwordCorrect) {
      throw new BadRequestError({ message: 'Invalid email or password' });
    }
    const { password, ...adminData } = admin;
    // Generate JWT tokens
    const accessToken = generateAccessJwtToken({ id: admin._id, email: admin.email });
    const refreshToken = generateRefreshJwtToken({ id: admin._id });
    // Cache the refresh token in Redis
    const cacheKey = `ADMIN_REFRESH_TOKEN:${admin._id}`;
    const expiry = settings.jwt.refresh_token_expires_in || 86400; // fallback 1 day
    await redisClient.set(cacheKey, refreshToken, expiry);
    return { admin: adminData, accessToken, refreshToken };
  }

  async forgotPassword(body: { email: string }): Promise<void> {
    const admin = await this.adminRepository.getAdmin({ email: body.email });
    logger.info(`Forgot password request for ${admin.email}`);
    if (!admin) {
      throw new BadRequestError({ message: 'Admin not found' });
    }
    // Generate OTP, cache in Redis, send via email
    const { resetPasswordCode, expiryDate } = await this.adminService.cachePasswordResetDetails(body.email);
    try {
      await EmailService.sendPasswordResetMail({ to: admin.email, code: resetPasswordCode, expiryDate: expiryDate.toISOString() });
      logger.info(`Password reset code for ${admin.email} is ${resetPasswordCode}, expires at ${expiryDate}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${admin.email}: ${error}`);
    }
  }

  async verifyResetPasswordOtp(email: string, code: string): Promise<void> {
    email = email.toLowerCase();
    const admin = await this.adminRepository.getAdmin({ email });
    if (!admin) {
      throw new BadRequestError({ message: 'Admin not found' });
    }
    const isValid = await this.adminService.isPasswordResetTokenValid(email, code);
    if (!isValid) {
      throw new BadRequestError({ message: 'Invalid or expired reset code' });
    }
    await this.adminService.clearCachedPasswordResetToken(email);
  }

  async resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestError({ message: 'Passwords do not match' });
    }

    const admin = await this.adminRepository.getAdmin({ email });
    if (!admin) {
      throw new BadRequestError({ message: 'Admin not found' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await this.adminRepository.updateAdmin({ email }, { password: hashedPassword });
  }

  async changePassword(email: string, oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestError({ message: 'Passwords do not match' });
    }
    const admin = await this.adminRepository.getAdmin({ email });
    if (!admin) {
      throw new BadRequestError({ message: 'Admin not found' });
    }
    const passwordCorrect = bcrypt.compareSync(oldPassword, admin.password);
    if (!passwordCorrect) {
      throw new BadRequestError({ message: 'Invalid old password' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    await this.adminRepository.updateAdmin({ email }, { password: hashedPassword });
  }
}

export default AdminController;
