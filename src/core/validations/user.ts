import z from 'zod';
import { STACK, USER_GENDER, USER_STATUS } from '../constants/user';
import { passwordValidator, phoneValidator } from '../helpers/utilities';

export const registrationSchema = z.object({
  firstname: z.string().trim().min(1, 'Firstname is required').max(50, 'Firstname must be at most 50 characters long'),
  lastname: z.string().trim().min(1, 'Lastname is required').max(50, 'Lastname must be at most 50 characters long'),
  email: z.string().email().toLowerCase().trim().min(1, 'Email is required').max(100, 'Email must be at most 100 characters long'),
  phone: phoneValidator.optional().or(z.literal(' ')),
  gender: z.enum([USER_GENDER.MALE, USER_GENDER.FEMALE]).transform((val) => val.toLowerCase()),
  stack: z.enum([STACK.FRONTEND, STACK.BACKEND, STACK.PRODUCT_DESIGN]).transform((val) => val.toLowerCase()),
  isEmailVerified: z.boolean().default(false),
  status: z.enum([USER_STATUS.Active, USER_STATUS.Inactive]).default(USER_STATUS.Inactive)
});

// Export the bulk registration schema as an array of user objects
export const bulkRegistrationSchema = z
  .array(registrationSchema)
  .nonempty('At least one user is required')
  .max(100, 'Maximum of 100 users can be uploaded at once');

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email(),
  password: z.string().trim().min(8).max(50)
});

export const verifyUserSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email(),
  verification_token: z.string().trim().min(6).max(32)
});

export const sendSignUpVerifyCodeSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email()
});

export const resendSignUpVerificationEmailSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email()
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().trim().min(120).max(150)
});

export const updateUserProfileSchema = z.object({
  firstname: z.string().trim().toLowerCase().min(1).optional(),
  lastname: z.string().trim().toLowerCase().min(1).optional(),
  phone: z.string().trim().min(10).max(13).optional(),
  password: passwordValidator.optional(),
  confirm_password: passwordValidator.optional(),
  email: z.string().trim().toLowerCase().min(10).max(50).email().optional()
});

export const changePasswordSchema = z.object({
  old_password: passwordValidator,
  new_password: passwordValidator,
  confirm_password: passwordValidator
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email()
});

export const verifyResetPasswordWithTokenSchema = z.object({
  email: z.string().trim().toLowerCase().min(10, 'Email is required').max(50).email(),
  reset_code: z.string().trim().min(6, 'Reset code is required').max(7)
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().min(10).max(50).email(),
  new_password: passwordValidator,
  confirm_password: passwordValidator
});
