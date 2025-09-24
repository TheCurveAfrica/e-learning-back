import { Router } from 'express';
import authRoute from './user';
import adminRoute from './admin';
import classRoute from './class';
import learningPathRoute from './learningPath';

const baseRoute = Router();

baseRoute.use('/auth/users', authRoute);
baseRoute.use('/auth/admins', adminRoute);
baseRoute.use('/classes', classRoute);
baseRoute.use('/learning-path', learningPathRoute);

export default baseRoute;
