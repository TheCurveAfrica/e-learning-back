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
}

export default AdminRequestHandler;
