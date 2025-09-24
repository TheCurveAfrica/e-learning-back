import mongoose, { Schema, Document } from 'mongoose';
import { IRecordedClass } from '../../interfaces/class';
import { STACK } from '../../constants/user';

export interface IRecordedClassModel extends Omit<IRecordedClass, '_id'>, Document {}

const RecordedClassSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    videoLink: { type: String, required: true, unique: true },
    stack: { type: String, required: true, enum: Object.values(STACK) }
  },
  {
    timestamps: true
  }
);

export const RecordedClass = mongoose.model<IRecordedClass>('Recorded', RecordedClassSchema);
