import { Router } from 'express';
import LearningPathRequestHandler from '../requestHandlers/learningPath';
import { learningPathCreationSchema, lessonSchema, learningPathUpdateSchema } from '../../../src/core/validations/learningPath';
import { SEGMENT, validationWrapper } from '../../../src/core/helpers/validators';
import LearningPathController from '../../../src/core/controllers/learningPath';
import { authenticate } from '../middlewares/authentication';
import { authorize } from '../middlewares/authorization';
import { uploadExcel } from '../../../src/core/config/multer';

const router = Router();
const learningPathController = new LearningPathController();
const learningPathRequestHandler = new LearningPathRequestHandler(learningPathController);

router.post(
  '/',
  validationWrapper(SEGMENT.BODY, learningPathCreationSchema),
  authenticate,
  authorize('admin'),
  learningPathRequestHandler.createLearningPath
);
router.get('/:id', authenticate, learningPathRequestHandler.getLearningPathById);
router.get('/', authenticate, learningPathRequestHandler.getAllLearningPaths);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validationWrapper(SEGMENT.BODY, learningPathUpdateSchema),
  learningPathRequestHandler.updateLearningPath
);
router.delete('/:id', authenticate, authorize('admin'), learningPathRequestHandler.deleteLearningPath);
router.post('/:id/lessons', validationWrapper(SEGMENT.BODY, lessonSchema), authenticate, authorize('admin'), learningPathRequestHandler.addLessons);
router.get('/:id/lessons', authenticate, learningPathRequestHandler.getLessons);
router.patch(
  '/:id/lessons/:lessonId',
  validationWrapper(SEGMENT.BODY, learningPathUpdateSchema),
  authenticate,
  authorize('admin'),
  learningPathRequestHandler.updateLesson
);
router.put('/:id/lessons/:lessonId', authenticate, authorize('admin', 'instructor'), learningPathRequestHandler.lessonToggle);
router.delete('/:id/lessons/:lessonId', authenticate, authorize('admin'), learningPathRequestHandler.deleteLesson);
router.post('/:id/lessons/bulk', authenticate, authorize('admin'), uploadExcel.single('file'), learningPathRequestHandler.bulkAddLessonsFromExcel);

export default router;
