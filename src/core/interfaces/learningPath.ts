import { Document, Types } from 'mongoose';

export interface ILessons {
  _id: string;
  week: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface ILessonsModel extends Omit<ILessons, '_id'>, Document {}

export interface ILearningPath {
  _id: string;
  stack: string;
  Instructor: string;
  lessons: Types.DocumentArray<ILessons>;
}
export interface ILearningPathModel extends Omit<ILearningPath, '_id'>, Document {}

export interface IBulkResult {
  created: ILessons[];
  duplicates: number[];
  invalidRows: any[];
}
