import { Router } from 'express';
import ClassRequestHandler from '../requestHandlers/class';
import { classCreationSchema, classUpdateSchema, recordedClassCreationSchema } from '../../../src/core/validations/class';
import { SEGMENT, validationWrapper } from '../../../src/core/helpers/validators';
import ClassController from '../../../src/core/controllers/class';
import { authenticate } from '../middlewares/authentication';
import { authorize } from '../middlewares/authorization';

const router = Router();
const classController = new ClassController();
const classRequestHandler = new ClassRequestHandler(classController);

router.post('/live', validationWrapper(SEGMENT.BODY, classCreationSchema), authenticate, authorize('admin'), classRequestHandler.createClass);
router.post(
  '/recorded',
  validationWrapper(SEGMENT.BODY, recordedClassCreationSchema),
  authenticate,
  authorize('admin'),
  classRequestHandler.addRecordedClass
);
router.get('/:id', authenticate, classRequestHandler.getClassById);
router.get('/', authenticate, classRequestHandler.getAllClasses);
router.put('/:id', authenticate, authorize('admin'), validationWrapper(SEGMENT.BODY, classUpdateSchema), classRequestHandler.updateClass);
router.delete('/:id', authenticate, authorize('admin'), classRequestHandler.deleteClass);

export default router;
