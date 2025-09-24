import { RequestHandler } from 'express';
import { responseHandler } from '../../core/helpers/utilities';
import LearningPathController from '../../../src/core/controllers/learningPath';
import BadRequestError from '../../core/errors/BadRequestError';

class LearningPathRequestHandler {
  private learningPathController: LearningPathController;

  constructor(_learningPathController: LearningPathController) {
    this.learningPathController = _learningPathController;
  }

  createLearningPath: RequestHandler = async (req, res, next) => {
    try {
      const newLearningPath = await this.learningPathController.createLearningPath(req.body);
      res.json(responseHandler(newLearningPath, 'Learning path created successfully'));
    } catch (error) {
      next(error);
    }
  };

  getLearningPathById: RequestHandler = async (req, res, next) => {
    try {
      const learningPath = await this.learningPathController.getLearningPathById(req.params.id);
      res.json(responseHandler(learningPath, 'Learning path fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAllLearningPaths: RequestHandler = async (req, res, next) => {
    try {
      const learningPaths = await this.learningPathController.getAllLearningPaths();
      res.json(responseHandler(learningPaths, 'Learning paths fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateLearningPath: RequestHandler = async (req, res, next) => {
    try {
      const updatedLearningPath = await this.learningPathController.updateLearningPath(req.params.id, req.body);
      res.json(responseHandler(updatedLearningPath, 'Learning path updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteLearningPath: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.learningPathController.deleteLearningPath(req.params.id);
      res.json(responseHandler(result, 'Learning path deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  addLessons: RequestHandler = async (req, res, next) => {
    try {
      const lessons = await this.learningPathController.addLessons(req.params.id as string, req.body);
      res.json(responseHandler(lessons, 'Lesson added successfully'));
    } catch (error) {
      next(error);
    }
  };

  bulkAddLessonsFromExcel: RequestHandler = async (req, res, next) => {
    try {
      const file = req.file;
      if (!file || !file.buffer) {
        throw new BadRequestError({ message: 'Excel file buffer missing' });
      }

      const result = await this.learningPathController.bulkAddLessonsFromExcel(req.params.id as string, file.buffer);

      res.json(
        responseHandler(
          { created: result.created.length, duplicates: result.duplicates.length, invalidRows: result.invalidRows.length, result },
          'Bulk users processed'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  getLessons: RequestHandler = async (req, res, next) => {
    try {
      const lessons = await this.learningPathController.getLessons(req.params.id as string);
      res.json(responseHandler(lessons, 'Lessons fetched successfully'));
    } catch (error) {
      next(error);
    }
  };

  lessonToggle: RequestHandler = async (req, res, next) => {
    try {
      const toggledLesson = await this.learningPathController.lessonToggle(req.params.id as string, req.params.lessonId as string);
      res.json(responseHandler(toggledLesson, 'Lesson completion status toggled successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateLesson: RequestHandler = async (req, res, next) => {
    try {
      const updatedLesson = await this.learningPathController.updateLesson(req.params.id as string, req.params.lessonId as string, req.body);
      res.json(responseHandler(updatedLesson, 'Lesson updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteLesson: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.learningPathController.deleteLesson(req.params.id as string, req.params.lessonId as string);
      res.json(responseHandler({ message: result }, 'Lesson deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export default LearningPathRequestHandler;
