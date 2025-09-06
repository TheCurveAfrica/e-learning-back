import { FilterQuery, UpdateQuery } from 'mongoose';
import { IAdmin } from '../interfaces/auth';
import { Admin, IAdminModel } from '../models/admin';

export class AdminRepository {
  async createAdmin(payload: Omit<IAdmin, '_id'>): Promise<IAdmin> {
    const admin = await Admin.create(payload);
    return this.convertToIAdmin(admin);
  }

  async getAdmin(filter: FilterQuery<IAdminModel>): Promise<IAdmin | null> {
    const admin = await Admin.findOne(filter);
    return admin ? this.convertToIAdmin(admin) : null;
  }

  async findAllAdmins(filter: FilterQuery<IAdminModel> = {}): Promise<IAdmin[]> {
    const admins = await Admin.find(filter).sort({ createdAt: -1 });
    return admins.map((admin) => this.convertToIAdmin(admin));
  }
  private convertToIAdmin(admin: IAdminModel): IAdmin {
    return {
      _id: admin._id.toString(),
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      password: admin.password,
      phone: admin.phone,
      role: admin.role,
      profilePicture: admin.profilePicture || ''
    };
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
