import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../interfaces/auth';

export interface IUserModel extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    stack: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model<IUserModel>('students', UserSchema);
