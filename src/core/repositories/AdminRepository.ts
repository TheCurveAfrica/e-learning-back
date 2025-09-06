import { FilterQuery, UpdateQuery } from 'mongoose';
import { IAdmin } from '../interfaces/auth';
import { Admin, IAdminModel } from '../models/admin';

export class AdminRepository {
  async createAdmin(payload: Omit<IAdmin, '_id'>): Promise<IAdmin> {
    const admin = await Admin.create(payload);
    const obj = admin.toObject();
    obj._id = admin._id.toString();
    return obj;
  }

  async getAdmin(filter: FilterQuery<IAdminModel>): Promise<IAdmin | null> {
    const admin = await Admin.findOne(filter);
    if (!admin) return null;
    const obj = admin.toObject();
    obj._id = admin._id.toString();
    return obj;
  }

  async findAllAdmins(filter: FilterQuery<IAdminModel> = {}): Promise<IAdmin[]> {
    const admins = await Admin.find(filter).sort({ createdAt: -1 });
    return admins.map((admin) => {
      const obj = admin.toObject();
      obj._id = admin._id.toString();
      return obj;
    });
  }

  async updateAdmin(filter: FilterQuery<IAdminModel>, payload: UpdateQuery<IAdminModel>): Promise<IAdminModel | null> {
    return await Admin.findOneAndUpdate(filter, payload, { new: true });
  }

  async deleteAdmin(filter: FilterQuery<IAdminModel>): Promise<{ deletedCount: number }> {
    const result = await Admin.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
  async countAdmin(filter: FilterQuery<IAdminModel>): Promise<number> {
    return await Admin.countDocuments(filter);
  }
}
