import { ILearningPath, ILessons, ILearningPathModel, IBulkResult } from '../interfaces/learningPath';
import BadRequestError from '../errors/BadRequestError';
import ResourceNotFoundError from '../errors/ResourceNotFoundError';
import LearningPathService from '../services/learningPath';
import { LearningPathRepository } from '../repositories/LearningPathRepository';

class LearningPathController {
  private learningPathRepository: LearningPathRepository;
  private learningPathService: LearningPathService;

  constructor() {
    this.learningPathRepository = new LearningPathRepository();
    this.learningPathService = new LearningPathService(this.learningPathRepository);
  }

  async createLearningPath(payload: Omit<ILearningPath, '_id'>): Promise<ILearningPath> {
    return await this.learningPathService.createLearningPath(payload);
  }

  async getLearningPathById(id: string): Promise<ILearningPath | null> {
    const LearningPath = await this.learningPathService.getLearningPathById(id);
    if (!LearningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    return LearningPath;
  }

  async getAllLearningPaths(): Promise<ILearningPath[]> {
    const learningPaths = await this.learningPathService.getAllLearningPaths();
    if (learningPaths.length === 0) {
      throw new ResourceNotFoundError({ message: 'No learning paths found', reason: 'No learning paths available' });
    }
    return learningPaths;
  }

  async updateLearningPath(id: string, payload: Partial<ILearningPathModel>): Promise<ILearningPath | null> {
    const existing = await this.learningPathService.getLearningPathById(id);
    if (!existing) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    return await this.learningPathService.updateLearningPath(id, payload);
  }

  async deleteLearningPath(id: string): Promise<{ deletedCount: number }> {
    const existing = await this.learningPathService.getLearningPathById(id);
    if (!existing) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    return await this.learningPathService.deleteLearningPath(id);
  }

  async addLessons(learningPathId: string, lessons: Omit<ILessons, '_id' | 'completed'>): Promise<ILessons[] | null> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    const existingWeeks = new Set<number>(learningPath.lessons.map((l: any) => Number(l.week)));
    if (existingWeeks.has(lessons.week)) {
      throw new BadRequestError({ message: `Lesson for week ${lessons.week} already exists`, reason: 'Duplicate week number' });
    }
    const payload: Omit<ILessons, '_id' | 'completed'>[] = [];
    payload.push(lessons);
    return await this.learningPathService.addLessons(learningPathId, payload);
  }

  async bulkAddLessonsFromExcel(learningPathId: string, fileBuffer: Buffer): Promise<IBulkResult> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    return await this.learningPathService.bulkAddLessonsFromExcel(learningPathId, fileBuffer);
  }

  async getLessons(learningPathId: string): Promise<ILessons[] | null> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    const lessons = await this.learningPathService.getLessons(learningPathId);
    if (!lessons || lessons.length === 0) {
      throw new ResourceNotFoundError({ message: 'No lessons found', reason: 'No lessons available for this learning path' });
    }
    return lessons;
  }

  async lessonToggle(learningPathId: string, lessonId: string): Promise<ILessons | null> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    const lesson = learningPath.lessons.find((l: any) => l._id.toString() === lessonId);
    if (!lesson) {
      throw new ResourceNotFoundError({ message: 'Lesson not found', reason: 'Invalid lesson ID' });
    }
    return await this.learningPathService.LessonToggle(learningPathId, lessonId);
  }

  async updateLesson(learningPathId: string, lessonId: string, payload: Partial<Omit<ILessons, '_id' | 'completed'>>): Promise<ILessons | null> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    const lesson = learningPath.lessons.find((l: any) => l._id.toString() === lessonId);
    if (!lesson) {
      throw new ResourceNotFoundError({ message: 'Lesson not found', reason: 'Invalid lesson ID' });
    }
    if (payload.week && payload.week !== lesson.week) {
      const existingWeeks = new Set<number>(learningPath.lessons.map((l: any) => Number(l.week)));
      if (existingWeeks.has(payload.week)) {
        throw new BadRequestError({ message: `Lesson for week ${payload.week} already exists`, reason: 'Duplicate week number' });
      }
    }
    return await this.learningPathService.updateLesson(learningPathId, lessonId, payload);
  }

  async deleteLesson(learningPathId: string, lessonId: string): Promise<string | null> {
    const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new ResourceNotFoundError({ message: 'Learning path not found', reason: 'Invalid learning path ID' });
    }
    const lesson = learningPath.lessons.find((l: any) => l._id.toString() === lessonId);
    if (!lesson) {
      throw new ResourceNotFoundError({ message: 'Lesson not found', reason: 'Invalid lesson ID' });
    }
    return await this.learningPathService.deleteLesson(learningPathId, lessonId);
  }
}

export default LearningPathController;
