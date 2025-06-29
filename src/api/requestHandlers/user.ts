import { RequestHandler } from 'express';
import { responseHandler } from '../../core/helpers/utilities';
import { VerificationTokenStatus } from '../../core/constants/user';
import UserController from '../../../src/core/controllers/user';
import BadRequestError from '../../core/errors/BadRequestError';

class UserRequestHandler {
  private userController: UserController;

  constructor(_userController: UserController) {
    this.userController = _userController;
  }

  register: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.register(req.body);
      res.json(responseHandler(user, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  };

  uploadManyUsersFromExcel: RequestHandler = async (req, res, next) => {
    try {
      const file = req.file;
      if (!file || !file.buffer) {
        throw new BadRequestError({ message: 'Excel file buffer missing' });
      }

      const result = await this.userController.bulkCreateUsersFromExcel(file.buffer);

      res.json(
        responseHandler(
          { created: result.created.length, duplicates: result.duplicates.length, invalidRows: result.invalidRows.length, result },
          'Bulk users processed'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  sendValidationEmail: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.sendValidationEmail(req.body.email);
      res.json(responseHandler(null, 'Verification email has been sent successfully'));
    } catch (error) {
      next(error);
    }
  };

  verifyEmail: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.verifyEmail(req.body.email, req.body.verification_token);
      res.json(responseHandler({ status: VerificationTokenStatus.Valid, user }, 'Email verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  resendSignupVerificationToken: RequestHandler = async (req, res, next) => {
    try {
      const { nextResendDuration } = await this.userController.resendVerificationEmail({ email: req.body.email, studentResend: false });
      res.json(responseHandler({ email: req.body.email, next_resend_duration: nextResendDuration }, 'Verification email has been sent successfully'));
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.loginUser(req.body);
      res.json(responseHandler(user, 'User login successfully'));
    } catch (error) {
      next(error);
    }
  };

  refreshToken: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.refreshToken({ userId: res.locals.user.id, refreshToken: req.body.refresh_token });
      res.json(responseHandler(user, 'User access token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  };

  logout: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.logout(res.locals.user.id);
      res.json(responseHandler(null, 'User logged out successfully'));
    } catch (error) {
      next(error);
    }
  };

  getUserProfile: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.me(res.locals.user.id);
      res.json(responseHandler(user, 'My details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  setInitialPassword: RequestHandler = async (req, res, next) => {
    try {
      const { email, password, confirm_password } = req.body;
      console.log(req.body);
      if (!email || !password || !confirm_password) {
        throw new BadRequestError({ message: 'Please fill all the required fields', reason: 'All fields are required' });
      }

      if (password !== confirm_password) {
        throw new BadRequestError({ message: 'Passwords do not match', reason: 'Password mismatch' });
      }

      const userData = await this.userController.setInitialPassword(email, { password });

      res.json(responseHandler(userData, 'Password set successfully. You may now login.'));
    } catch (error) {
      next(error);
    }
  };

  changePassword: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.changePassword(res.locals.user.id, {
        oldPassword: req.body.old_password,
        newPassword: req.body.new_password,
        confirmPassword: req.body.confirm_password
      });
      res.json(responseHandler(null, 'User password updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  forgotPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.forgotPassword(req.body.email);
      res.json(responseHandler(null, 'Password reset email sent successfully'));
    } catch (error) {
      next(error);
    }
  };

  verifyResetPasswordWithToken: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.verifyResetPasswordWithToken(req.body.email, req.body.reset_code);
      res.json(responseHandler(null, 'Password reset code verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllUsers: RequestHandler = async (req, res, next) => {
    try {
      const users = await this.userController.findAllUsers();
      res.json(responseHandler(users, 'Users retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  resetPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.userController.resetPassword(req.body.email, req.body.new_password, req.body.confirm_password);
      res.json(responseHandler(null, 'Password reset successfully'));
    } catch (error) {
      next(error);
    }
  };

  viewUser: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userController.viewUser(req.query.email as string);
      res.json(responseHandler(user, 'User retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export default UserRequestHandler;
