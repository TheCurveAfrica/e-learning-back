import { Router } from 'express';
import authRoute from './user';
import adminRoute from './admin';

const baseRoute = Router();

baseRoute.use('/auth/users', authRoute);
baseRoute.use('/auth/admins', adminRoute);

export default baseRoute;
