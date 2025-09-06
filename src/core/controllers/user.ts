import bcrypt from 'bcrypt';
import BadRequestError from '../errors/BadRequestError';
import { LoginResponse, ResendVerificationEmailResponse, UserProfileData } from '../interfaces/auth';
import ResourceNotFoundError from '../errors/ResourceNotFoundError';
import { capitalizeFirstLetter } from '../helpers/utilities';
import { IUser, SetPassword } from '../interfaces/auth';
import UserService from '../services/user';
import { USER_STATUS, VerificationTokenStatus } from '../constants/user';
import { logger } from '../utils/logger';
import settings from '../config/application';
import EmailService from '../services/email';
import { generateAccessJwtToken, generateRefreshJwtToken } from '../helpers/auth';

class UserController {
  private userService: UserService;

  constructor(_userService: UserService) {
    this.userService = _userService;
  }

  async bulkCreateUsersFromExcel(fileBuffer: Buffer): Promise<{ created: IUser[]; duplicates: string[]; invalidRows: any[] }> {
    return await this.userService.bulkCreateUsersFromExcel(fileBuffer);
  }

  async register(body: Omit<IUser, '_id'>): Promise<Partial<IUser | ResendVerificationEmailResponse>> {
    const user = await this.userService.getUser({ email: body.email });
    if (user) {
      throw new BadRequestError({ message: 'User already exists', reason: 'User already registered' });
    }

    if (body.password && body.password !== '') {
      const saltPassword = bcrypt.genSaltSync(10);
      body.password = bcrypt.hashSync(body.password, saltPassword);
    }
    if (body.phone === '' || body.phone === undefined) {
      body.phone = ' ';
    }
    body.firstname = capitalizeFirstLetter(body.firstname);
    body.lastname = capitalizeFirstLetter(body.lastname);
    body.password = ' ';

    const newUser = await this.userService.createUser(body);

    const userData = {
      _id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      phone: newUser.phone,
      gender: newUser.gender,
      isEmailVerified: newUser.isEmailVerified,
      stack: newUser.stack,
      status: newUser.status,
      role: newUser.role
    };

    return userData;
  }
  // async bulkCreateUsers(body: Omit<IUser, '_id'>[]): Promise<IUser[]> {
  //   if (!Array.isArray(body) || body.length === 0) {
  //     throw new BadRequestError({ message: 'Users data must be a non-empty array' });
  //   }

  //   try {
  //     const emails = body.map((user) => user.email);

  //     const existingUsers = await this.userService.findAllUsers({ email: { $in: emails } });
  //     const existingEmails = new Set(existingUsers.map((user) => user.email));

  //     const newUsers = body.filter((user) => !existingEmails.has(user.email));
  //     if (newUsers.length === 0) {
  //       return [];
  //     }

  //     const usersWithHashedPasswords = newUsers.map((user) => {
  //       const saltPassword = bcrypt.genSaltSync(10);
  //       return {
  //         ...user,
  //         password: bcrypt.hashSync(user.password, saltPassword)
  //       };
  //     });

  //     const createdUsers = await this.userService.bulkCreateUsers(usersWithHashedPasswords);

  //     return createdUsers;
  //   } catch (error) {
  //     console.error('Error in bulkCreateUsers:', error);
  //     throw error;
  //   }
  // }

  async sendValidationEmail(email: string): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError({ message: 'Invalid email format', reason: 'Email format is incorrect' });
    }
    if (email.length > 50) {
      throw new BadRequestError({ message: 'Email is too long', reason: 'Email length exceeds limit' });
    }
    if (email.length < 10) {
      throw new BadRequestError({ message: 'Email is too short', reason: 'Email length is below minimum' });
    }
    if (email.includes(' ')) {
      throw new BadRequestError({ message: 'Email cannot contain spaces', reason: 'Email contains invalid characters' });
    }
    const student = await this.userService.getUser({ email });
    if (!student) {
      throw new ResourceNotFoundError({ message: `Student with email: ${email} not found`, reason: `Student with ${email} has not been registered` });
    }

    if (student.isEmailVerified) {
      throw new BadRequestError({ message: `User with email: ${email} is already verified`, reason: 'Email already verified' });
    }

    const { verificationLink } = await this.userService.cacheEmailVerificationDetail({
      email
    });
    try {
      await EmailService.sendEmailVerificationCode({ to: student.email, code: verificationLink });
      logger.info(`Verification email sent to ${student.email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${student.email}:`, error);
    }
  }

  async resendVerificationEmail(params: { email: string; studentResend?: boolean }): Promise<{ email: string; nextResendDuration: number }> {
    const user = await this.userService.getUser({ email: params.email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    } else if (user.isEmailVerified) {
      throw new BadRequestError({ message: `User with email: ${params.email} is already verified`, reason: 'Email already verified' });
    }

    const { verificationLink } = await this.userService.cacheEmailVerificationDetail({
      email: params.email,
      studentResend: !!params.studentResend
    });

    try {
      await EmailService.sendEmailVerificationCode({ to: user.email, code: verificationLink });
      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${user.email}:`, error);
    }

    return {
      email: user.email,
      nextResendDuration: settings.customer_email_verification.resend_limit_lockout_duration
    };
  }

  async verifyEmail(email: string, verificationToken: string): Promise<{ firstname: string; lastname: string; email: string }> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    if (user.isEmailVerified) {
      throw new BadRequestError({ message: `User with email: ${email} is already verified`, reason: 'Email already verified' });
    }

    const isTokenValid = await this.userService.isVerificationCodeValid(email, verificationToken);
    if (!isTokenValid) {
      throw new BadRequestError({
        message: 'Verification token has expired',
        data: { status: VerificationTokenStatus.Expired }
      });
    }
    await this.userService.updateUser({ isEmailVerified: true }, { email });

    await this.userService.clearCachedVerificationCode(email);

    return {
      firstname: capitalizeFirstLetter(user.firstname),
      lastname: capitalizeFirstLetter(user.lastname),
      email: user.email
    };
  }

  async setInitialPassword(email: string, body: { password: string }): Promise<UserProfileData> {
    const user = await this.userService.getUser({ email });

    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found' });
    }

    if (!user.isEmailVerified) {
      throw new BadRequestError({ message: 'Email not verified', reason: 'User email is not verified' });
    }

    const hashedPassword = bcrypt.hashSync(body.password, 10);
    const updatedUser = await this.userService.updateUser({ password: hashedPassword }, { email });

    if (!updatedUser) {
      throw new BadRequestError({ message: 'Failed to update password' });
    }

    const userData: UserProfileData = {
      id: updatedUser._id.toString(),
      firstname: updatedUser.firstname,
      lastname: updatedUser.lastname,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      stack: updatedUser.stack,
      status: updatedUser.status,
      isEmailVerified: updatedUser.isEmailVerified
    };

    return userData;
  }

  async loginUser(body: { email: string; password: string }): Promise<LoginResponse> {
    const user = await this.userService.getUser({ email: body.email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'Student not found', reason: 'Student not registered' });
    }

    if (!user.isEmailVerified) {
      throw new BadRequestError({ message: 'Email not verified', reason: 'User email is not verified' });
    }

    if (user.password === ' ') {
      throw new BadRequestError({ message: 'Password not set, Please set your password to login', reason: 'Password not set' });
    }

    if (user.status === USER_STATUS.Inactive && !user.isEmailVerified) {
      throw new BadRequestError({ message: 'User is inactive', reason: "User's account has not been activated" });
    }

    const passwordCorrect = bcrypt.compareSync(body.password, user.password);

    if (!passwordCorrect) {
      throw new BadRequestError({ message: 'Invalid password or email' });
    }

    const accessToken = generateAccessJwtToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshJwtToken({ id: user._id });
    await this.userService.cacheRefreshToken({ userId: user._id, refreshToken });

    if (user.status === USER_STATUS.Inactive && user.isEmailVerified) {
      await this.userService.updateUser({ status: USER_STATUS.Active }, { email: user.email });
    }

    const { firstname, lastname, email } = user;

    return { firstname, lastname, email, accessToken, refreshToken } as LoginResponse;
  }

  async refreshToken(data: {
    userId: string;
    refreshToken: string;
  }): Promise<{ _id: string; name: string; email: string; accessToken: string; refreshToken: string }> {
    const user = await this.userService.getUser({ _id: data.userId });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    const isTokenValid = await this.userService.isRefreshTokenValid({ userId: data.userId, refreshToken: data.refreshToken });
    if (!isTokenValid) {
      throw new BadRequestError({ message: 'Invalid refresh token', reason: 'Refresh token is invalid' });
    }

    const accessToken = generateAccessJwtToken({ id: user._id, email: user.email });

    const { _id, firstname, lastname, email } = user;
    const name = `${firstname} ${lastname}`;
    return { _id, name, email, accessToken, refreshToken: data.refreshToken };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userService.getUser({ _id: userId });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    await this.userService.clearCachedToken(userId);
  }

  async me(userId: number): Promise<UserProfileData> {
    const user = await this.userService.getUserWithRoleName({ _id: userId });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    const userData = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      // role: (user as any).role.name,
      isEmailVerified: user.isEmailVerified
    };

    return userData;
  }

  async changePassword(userId: number, body: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    const user = await this.userService.getUser({ _id: userId });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    const passwordCorrect = bcrypt.compare(body.oldPassword, user.password);
    if (!passwordCorrect) {
      throw new BadRequestError({ message: 'Invalid old password', reason: 'Old password is incorrect' });
    }

    if (body.newPassword !== body.confirmPassword) {
      throw new BadRequestError({ message: 'New password and confirm password do not match', reason: 'Password mismatch' });
    }

    if (body.oldPassword === body.newPassword) {
      throw new BadRequestError({ message: 'New password cannot be the same as old password' });
    }
    const saltPassword = bcrypt.genSaltSync(10);
    body.newPassword = bcrypt.hashSync(body.newPassword, saltPassword);

    await this.userService.updateUser({ password: body.newPassword }, { _id: userId });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }
    if (!user.isEmailVerified) {
      throw new BadRequestError({ message: 'Email not verified', reason: 'User email is not verified' });
    }

    if (user.password === ' ') {
      throw new BadRequestError({ message: 'Password not set, Please set your password and proceed to login', reason: 'Password not set' });
    }

    const { resetPasswordLink, resetPasswordLinkExpiry } = await this.userService.cachePasswordResetDetails(email);

    try {
      await EmailService.sendPasswordResetMail({
        to: user.email,
        code: resetPasswordLink,
        expiryDate: resetPasswordLinkExpiry.toISOString()
      });
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${user.email}:`, error);
    }
  }
  async verifyResetPasswordWithToken(email: string, resetPasswordCode: string): Promise<void> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    const isResetPasswordCodeValid = await this.userService.isPasswordResetTokenValid(email, resetPasswordCode);
    if (!isResetPasswordCodeValid) {
      throw new BadRequestError({
        message: 'Password reset token has expired',
        data: { status: VerificationTokenStatus.Expired }
      });
    }

    await this.userService.clearCachedPasswordResetToken(email);
  }

  async findAllUsers(): Promise<IUser[]> {
    const users = await this.userService.findAllUsers();
    return users;
  }

  async resetPassword(email: string, new_password: string, confirm_password: string): Promise<void> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }

    if (new_password !== confirm_password) {
      throw new BadRequestError({ message: 'New password and confirm password do not match', reason: 'Password mismatch' });
    }

    const saltPassword = bcrypt.genSaltSync(10);
    new_password = bcrypt.hashSync(new_password, saltPassword);

    await this.userService.updateUser({ password: new_password }, { email });
  }

  async viewUser(email: string): Promise<{ firstname: string; lastname: string; email: string }> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new ResourceNotFoundError({ message: 'User not found', reason: 'Student not registered' });
    }
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    };
  }
}

export default UserController;
