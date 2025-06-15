import { Router } from 'express';
import authRoute from './user';

const baseRoute = Router();

baseRoute.use('/auth', authRoute);

export default baseRoute;
