import { RequestHandler } from 'express';
import { responseHandler } from '../../core/helpers/utilities';
import DashboardController from '../../../src/core/controllers/dashboard';
import BadRequestError from '../../core/errors/BadRequestError';
import { USER_ROLES } from '../../core/constants/user';

class DashboardRequestHandler {
  private dashboardController: DashboardController;
  constructor(_dashboardController: DashboardController) {
    this.dashboardController = _dashboardController;
  }

  adminDashboard: RequestHandler = async (req, res, next) => {
    try {
      const classType = req.query.type as string;
      if (!classType || !Object.values(USER_ROLES).includes(classType as USER_ROLES)) {
        throw new BadRequestError({ message: 'Invalid class type', reason: 'Class type must be either live or recorded' });
      }

      const dashboard = await (classType === USER_ROLES.ADMIN ? this.dashboardController.adminDashboardStats() : null); // student dashboard

      res.json(responseHandler(dashboard, 'Class fetched successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export default DashboardRequestHandler;
