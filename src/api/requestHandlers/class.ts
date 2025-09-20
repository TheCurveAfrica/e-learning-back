import { RequestHandler } from 'express';
import { responseHandler } from '../../core/helpers/utilities';
import ClassController from '../../../src/core/controllers/class';
import BadRequestError from '../../core/errors/BadRequestError';
import { CLASS_QUERY } from '../../core/constants/user';

class ClassRequestHandler {
  private classController: ClassController;

  constructor(_classController: ClassController) {
    this.classController = _classController;
  }

  createClass: RequestHandler = async (req, res, next) => {
    try {
      const newClass = await this.classController.createClass(req.body);
      res.json(responseHandler(newClass, 'Class created successfully'));
    } catch (error) {
      next(error);
    }
  };

  addRecordedClass: RequestHandler = async (req, res, next) => {
    try {
      const newClass = await this.classController.addRecordedClass(req.body);
      res.json(responseHandler(newClass, 'Recorded class added successfully'));
    } catch (error) {
      next(error);
    }
  };

  getClassById: RequestHandler = async (req, res, next) => {
    try {
      const classType = req.query.type as string;
      if (!classType || !Object.values(CLASS_QUERY).includes(classType as CLASS_QUERY)) {
        throw new BadRequestError({ message: 'Invalid class type', reason: 'Class type must be either live or recorded' });
      }

      const classData = await (classType === CLASS_QUERY.LIVE
        ? this.classController.getClassById(req.params.id)
        : this.classController.getRecordedClass(req.params.id));

      res.json(responseHandler(classData, 'Class fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllClasses: RequestHandler = async (req, res, next) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const classType = req.query.type as string;
      if (!classType || !Object.values(CLASS_QUERY).includes(classType as CLASS_QUERY)) {
        throw new BadRequestError({ message: 'Invalid class type', reason: 'Class type must be either live or recorded' });
      }

      const classes = await (classType === CLASS_QUERY.LIVE
        ? this.classController.getAllClasses(page, limit)
        : this.classController.getAllRecordedClasses(page, limit));

      res.json(responseHandler(classes, 'Classes fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateClass: RequestHandler = async (req, res, next) => {
    try {
      const classType = req.query.type as string;
      if (!classType || !Object.values(CLASS_QUERY).includes(classType as CLASS_QUERY)) {
        throw new BadRequestError({ message: 'Invalid class type', reason: 'Class type must be either live or recorded' });
      }

      const updated = await (classType === CLASS_QUERY.LIVE
        ? this.classController.updateClass(req.params.id, req.body)
        : this.classController.updateRecordedClass(req.params.id, req.body));

      res.json(responseHandler(updated, 'Class updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteClass: RequestHandler = async (req, res, next) => {
    try {
      const classType = req.query.type as string;
      if (!classType || !Object.values(CLASS_QUERY).includes(classType as CLASS_QUERY)) {
        throw new BadRequestError({ message: 'Invalid class type', reason: 'Class type must be either live or recorded' });
      }

      const result = await (classType === CLASS_QUERY.LIVE
        ? this.classController.deleteClass(req.params.id)
        : this.classController.deleteRecordedClass(req.params.id));

      res.json(responseHandler(result, 'Classes deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
export default ClassRequestHandler;
