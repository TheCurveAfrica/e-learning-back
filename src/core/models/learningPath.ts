import mongoose, { Schema } from 'mongoose';
import { ILearningPathModel, ILessonsModel } from '../interfaces/learningPath';

const LessonsSchema: Schema = new Schema<ILessonsModel>(
  {
    week: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { _id: true }
);

const LearningPathSchema: Schema = new Schema(
  {
    stack: { type: String, required: true },
    Instructor: { type: String, required: true },
    lessons: { type: [LessonsSchema], default: [] }
  },
  { timestamps: true }
);

export const LearningPath = mongoose.model<ILearningPathModel>('learningPaths', LearningPathSchema);
