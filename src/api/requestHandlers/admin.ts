import { RequestHandler } from 'express';
import { responseHandler } from '../../core/helpers/utilities';
import AdminController from '../../../src/core/controllers/admin';
import BadRequestError from '../../core/errors/BadRequestError';

class AdminRequestHandler {
  private adminController: AdminController;

  constructor(_adminController: AdminController) {
    this.adminController = _adminController;
  }

  register: RequestHandler = async (req, res, next) => {
    try {
      const admin = await this.adminController.register(req.body);
      res.json(responseHandler(admin, 'Admin registered successfully'));
    } catch (error) {
      next(error);
    }
  };

  login: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.adminController.login(req.body);
      res.json(responseHandler(result, 'Admin login successful'));
    } catch (error) {
      next(error);
    }
  };

  forgotPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.adminController.forgotPassword(req.body);
      res.json(responseHandler(null, 'OTP sent to email for password reset'));
    } catch (error) {
      next(error);
    }
  };

  verifyResetPasswordOtp: RequestHandler = async (req, res, next) => {
    try {
      const { email, code } = req.body;
      await this.adminController.verifyResetPasswordOtp(email, code);
      res.json(responseHandler(null, 'Admin password reset OTP verified successfully'));
    } catch (error) {
      next(error);
    }
  };

  resetPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.adminController.resetPassword(req.body.email, req.body.newPassword, req.body.confirmPassword);
      res.json(responseHandler(null, 'Password reset successful'));
    } catch (error) {
      next(error);
    }
  };

  changePassword: RequestHandler = async (req, res, next) => {
    try {
      await this.adminController.changePassword(req.body.email, req.body.oldPassword, req.body.newPassword, req.body.confirmPassword);
      res.json(responseHandler(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export default AdminRequestHandler;
