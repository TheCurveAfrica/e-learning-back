import { Router } from 'express';
import authRoute from './user';
import adminRoute from './admin';
import classRoute from './class';

const baseRoute = Router();

baseRoute.use('/auth/users', authRoute);
baseRoute.use('/auth/admins', adminRoute);
baseRoute.use('/classes', classRoute);

export default baseRoute;
