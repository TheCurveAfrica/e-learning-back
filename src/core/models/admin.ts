import mongoose, { Schema, Document } from 'mongoose';
import { IAdmin } from '../interfaces/auth';

export interface IAdminModel extends Omit<IAdmin, '_id'>, Document {}

const AdminSchema: Schema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const Admin = mongoose.model<IAdmin>('admins', AdminSchema);
