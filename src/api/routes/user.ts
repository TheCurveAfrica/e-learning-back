import { Router } from 'express';
import { UserRepository } from '../../core/repositories/UserRepository';
import UserRequestHandler from '../requestHandlers/user';
import {
  bulkRegistrationSchema,
  changePasswordSchema,
  forgotPasswordSchema,
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
import { uploadExcel } from '../../../src/core/config/multer';

const router = Router();
const userService = new UserService(new UserRepository());
const userController = new UserController(userService);
const userRequestHandler = new UserRequestHandler(userController);

const authRoute = (): Router => {
  router.post('/register', validationWrapper(SEGMENT.BODY, registrationSchema), userRequestHandler.register);
  router.post('/bulk-uploads', uploadExcel.single('file'), userRequestHandler.uploadManyUsersFromExcel);
  router.post('/login', validationWrapper(SEGMENT.BODY, loginSchema), userRequestHandler.login);
  router.post('/email/verification-code', validationWrapper(SEGMENT.BODY, sendSignUpVerifyCodeSchema), userRequestHandler.sendValidationEmail);
  router.post('/email/verify', validationWrapper(SEGMENT.BODY, verifyUserSchema), userRequestHandler.verifyEmail);
  router.post(
    '/email/resend-verification',
    validationWrapper(SEGMENT.BODY, resendSignUpVerificationEmailSchema),
    userRequestHandler.resendSignupVerificationToken
  );
  router.post('/refresh-token', validationWrapper(SEGMENT.BODY, refreshTokenSchema), userRequestHandler.refreshToken);
  router.post('/logout', authenticate, userRequestHandler.logout);
  router.get('/profile', authenticate, userRequestHandler.getUserProfile);
  router.patch('/set-password', validationWrapper(SEGMENT.BODY, updateUserProfileSchema), userRequestHandler.setInitialPassword);
  router.post('/change-password', validationWrapper(SEGMENT.BODY, changePasswordSchema), authenticate, userRequestHandler.changePassword);
  router.post('/forgot-password', validationWrapper(SEGMENT.BODY, forgotPasswordSchema), userRequestHandler.forgotPassword);
  router.post(
    '/reset-password/verify',
    validationWrapper(SEGMENT.BODY, verifyResetPasswordWithTokenSchema),
    userRequestHandler.verifyResetPasswordWithToken
  );
  router.patch('/reset-password', validationWrapper(SEGMENT.BODY, resetPasswordSchema), userRequestHandler.resetPassword);
  router.get('/', userRequestHandler.getAllUsers);
  router.get('/view', userRequestHandler.viewUser);
  return router;
};

export default authRoute();
