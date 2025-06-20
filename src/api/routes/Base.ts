import { Router } from 'express';
import authRoute from './user';

const baseRoute = Router();

baseRoute.use('/auth/users', authRoute);

export default baseRoute;
