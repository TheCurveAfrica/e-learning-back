import z from 'zod';
import { USER_ROLES } from '../constants/user';
import { passwordValidator, phoneValidator } from '../helpers/utilities';

export const adminRegistrationSchema = z.object({
  firstname: z.string().trim().min(1, 'Firstname is required').max(50, 'Firstname must be at most 50 characters long'),
  lastname: z.string().trim().min(1, 'Lastname is required').max(50, 'Lastname must be at most 50 characters long'),
  email: z.string().email().toLowerCase().trim().min(1, 'Email is required').max(100, 'Email must be at most 100 characters long'),
  phone: phoneValidator.optional().or(z.literal(' ')),
  role: z
    .enum([USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR])
    .transform((val) => val.toLowerCase())
    .default(USER_ROLES.INSTRUCTOR),
  profilePicture: z.string().optional(),
  password: passwordValidator.optional()
});

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').max(100).email(),
  password: z.string().trim().min(8, 'Password must be at least 8 characters').max(50)
});

export const adminForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').max(100).email()
});

export const adminResetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').max(100).email(),
  code: z.string().trim().length(6, 'OTP code must be 6 digits'),
  newPassword: passwordValidator,
  confirmPassword: passwordValidator
});

export const adminChangePasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Email is required').max(100).email(),
  oldPassword: passwordValidator,
  newPassword: passwordValidator,
  confirmPassword: passwordValidator
});
