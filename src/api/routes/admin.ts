import { Router } from 'express';
import AdminController from '../../core/controllers/admin';
import AdminRequestHandler from '../requestHandlers/admin';
import { adminRegistrationSchema } from '../../core/validations/admin';
import { SEGMENT, validationWrapper } from '../../core/helpers/validators';

const router = Router();
const adminController = new AdminController();
const adminRequestHandler = new AdminRequestHandler(adminController);

router.post('/register', validationWrapper(SEGMENT.BODY, adminRegistrationSchema), adminRequestHandler.register);

export default router;
