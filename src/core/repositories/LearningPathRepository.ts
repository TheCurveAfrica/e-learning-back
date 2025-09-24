import { FilterQuery } from 'mongoose';
import { ILessons, ILearningPath, ILearningPathModel, ILessonsModel } from '../interfaces/learningPath';
import { LearningPath } from '../models/learningPath';

export class LearningPathRepository {
  async createLearningPath(payload: Omit<ILearningPath, '_id'>): Promise<ILearningPath> {
    const learningPath = await LearningPath.create(payload);
    return this.convertToILearningPath(learningPath);
  }

  async findLearningPathById(id: string): Promise<ILearningPath | null> {
    const learningPath = await LearningPath.findById(id);
    return learningPath ? this.convertToILearningPath(learningPath) : null;
  }

  async findLearningPaths(filter: FilterQuery<ILearningPathModel> = {}): Promise<ILearningPath[]> {
    const learningPaths = await LearningPath.find(filter);
    return learningPaths.map((lp) => this.convertToILearningPath(lp));
  }

  async updateLearningPath(id: string, payload: Partial<ILearningPathModel>): Promise<ILearningPath | null> {
    const learningPath = await LearningPath.findByIdAndUpdate(id, payload, { new: true });
    return learningPath ? this.convertToILearningPath(learningPath) : null;
  }

  async deleteLearningPath(id: string): Promise<{ deletedCount: number }> {
    const result = await LearningPath.deleteMany({ _id: id });
    return { deletedCount: result.deletedCount };
  }

  async createLessons(learningPathId: string, payload: Omit<ILessons, '_id' | 'completed'>[]): Promise<ILessons[] | null> {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) return null;
    learningPath.lessons.push(...payload);
    await learningPath.save();
    const lessons = learningPath.lessons.map((ls) => this.convertToILessons(ls)).sort((a, b) => a.week - b.week);
    return lessons;
  }

  async getLessons(learningPathId: string): Promise<ILessons[] | null> {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) return null;
    const lessons = learningPath.lessons.map((ls) => this.convertToILessons(ls)).sort((a, b) => a.week - b.week);
    return lessons;
  }

  async toggleLessonCompleted(learningPathId: string, lessonId: string): Promise<ILessons | null> {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) return null;
    const lesson = learningPath.lessons.id(lessonId);
    if (!lesson) return null;
    lesson.completed = !lesson.completed;
    await learningPath.save();
    return lesson;
  }

  async updateLessons(learningPathId: string, lessonId: string, payload: Partial<Omit<ILessons, '_id' | 'completed'>>): Promise<ILessons | null> {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) return null;
    const lesson = learningPath.lessons.id(lessonId);
    if (!lesson) return null;
    lesson.set(payload);
    await learningPath.save();
    return lesson;
  }

  async deleteLesson(learningPathId: string, lessonId: string): Promise<string | null> {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) return null;
    const lesson = learningPath.lessons.id(lessonId);
    lesson.deleteOne();
    await learningPath.save();
    return 'Lesson deleted successfully';
  }

  private convertToILearningPath(learningPath: ILearningPathModel): ILearningPath {
    return {
      _id: learningPath._id.toString(),
      stack: learningPath.stack,
      Instructor: learningPath.Instructor,
      lessons: learningPath.lessons
    };
  }

  private convertToILessons(lesson: ILessonsModel): ILessons {
    return {
      _id: lesson._id.toString(),
      week: lesson.week,
      title: lesson.title,
      description: lesson.description,
      completed: lesson.completed
    };
  }
}
