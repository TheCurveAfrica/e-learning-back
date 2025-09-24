import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from '../../interfaces/class';
import { STACK } from '../../constants/user';

export interface IClassModel extends Omit<IClass, '_id'>, Document {}

const ClassSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    classLink: { type: String, required: true },
    location: { type: String, required: true },
    stack: { type: String, required: true, enum: Object.values(STACK) }
  },
  {
    timestamps: true
  }
);

export const Class = mongoose.model<IClass>('classes', ClassSchema);
