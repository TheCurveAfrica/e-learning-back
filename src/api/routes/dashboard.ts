import { Router } from 'express';
import DashboardRequestHandler from '../requestHandlers/dashboard';
import DashboardController from '../../../src/core/controllers/dashboard';
import { authenticate } from '../middlewares/authentication';

const router = Router();
const dashboardController = new DashboardController();
const dashboardRequestHandler = new DashboardRequestHandler(dashboardController);

router.get('/', authenticate, dashboardRequestHandler.adminDashboard);

export default router;
