import { Router } from 'express';
import { UserRepository } from '../../core/repositories/UserRepository';
import UserRequestHandler from '../requestHandlers/user';
import {
  bulkRegistrationSchema,
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registrationSchema,
  resendSignUpVerificationEmailSchema,
  resetPasswordSchema,
  sendSignUpVerifyCodeSchema,
  updateUserProfileSchema,
  verifyResetPasswordWithTokenSchema,
  verifyUserSchema
} from '../../../src/core/validations/user';
import { SEGMENT, validationWrapper } from '../../../src/core/helpers/validators';
import UserService from '../../../src/core/services/user';
import UserController from '../../../src/core/controllers/user';
import { authenticate } from '../middlewares/authentication';

const router = Router();
const userService = new UserService(new UserRepository());
const userController = new UserController(userService);
const userRequestHandler = new UserRequestHandler(userController);

const authRoute = (): Router => {
  router.post('/register', validationWrapper(SEGMENT.BODY, registrationSchema), userRequestHandler.register);
  router.post('/bulk-uploads', validationWrapper(SEGMENT.BODY, bulkRegistrationSchema), userRequestHandler.createManyUsers);
  router.post('/login', validationWrapper(SEGMENT.BODY, loginSchema), userRequestHandler.login);
  router.post('/email/verification-code', validationWrapper(SEGMENT.BODY, sendSignUpVerifyCodeSchema), userRequestHandler.sendValidationEmail);
  router.post('/email/verify', validationWrapper(SEGMENT.BODY, verifyUserSchema), userRequestHandler.verifyEmail);
  router.post(
    '/email/resend-verification',
    validationWrapper(SEGMENT.BODY, resendSignUpVerificationEmailSchema),
    userRequestHandler.resendSignupVerificationToken
  );
  router.post('/refresh-token', validationWrapper(SEGMENT.BODY, refreshTokenSchema), authenticate, userRequestHandler.refreshToken);
  router.post('/logout', authenticate, userRequestHandler.logout);
  router.get('/profile', authenticate, userRequestHandler.getUserProfile);
  router.patch('/set-password', validationWrapper(SEGMENT.BODY, updateUserProfileSchema), authenticate, userRequestHandler.updateUserPassword);
  router.post('/change-password', validationWrapper(SEGMENT.BODY, changePasswordSchema), authenticate, userRequestHandler.changePassword);
  router.post('/reset-password', validationWrapper(SEGMENT.BODY, resetPasswordSchema), userRequestHandler.resetPassword);
  router.post(
    '/reset-password/verify',
    validationWrapper(SEGMENT.BODY, verifyResetPasswordWithTokenSchema),
    userRequestHandler.verifyResetPasswordWithToken
  );

  return router;
};

export default authRoute();
