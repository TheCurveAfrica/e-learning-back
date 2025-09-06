import { Router } from 'express';
import AdminController from '../../core/controllers/admin';
import AdminRequestHandler from '../requestHandlers/admin';
import {
  adminRegistrationSchema,
  adminLoginSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  adminChangePasswordSchema
} from '../../core/validations/admin';
import { SEGMENT, validationWrapper } from '../../core/helpers/validators';

const router = Router();
const adminController = new AdminController();
const adminRequestHandler = new AdminRequestHandler(adminController);

// Register
router.post('/register', validationWrapper(SEGMENT.BODY, adminRegistrationSchema), adminRequestHandler.register);

// Login
router.post('/login', validationWrapper(SEGMENT.BODY, adminLoginSchema), adminRequestHandler.login);

// Forgot Password
router.post('/forgot-password', validationWrapper(SEGMENT.BODY, adminForgotPasswordSchema), adminRequestHandler.forgotPassword);

// Reset Password
router.post(
  '/reset-password',
  validationWrapper(SEGMENT.BODY, adminResetPasswordSchema.pick({ email: true, newPassword: true, confirmPassword: true })),
  adminRequestHandler.resetPassword
);

// Change Password
router.post('/change-password', validationWrapper(SEGMENT.BODY, adminChangePasswordSchema), adminRequestHandler.changePassword);

// Verify Reset Password OTP
router.post(
  '/reset-password/verify-otp',
  validationWrapper(SEGMENT.BODY, adminResetPasswordSchema.pick({ email: true, code: true })),
  adminRequestHandler.verifyResetPasswordOtp
);

export default router;
