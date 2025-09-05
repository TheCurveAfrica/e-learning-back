import { AdminRepository } from '../repositories/AdminRepository';
import { IAdmin } from '../interfaces/auth';
import { FilterQuery } from 'mongoose';
import { IAdminModel } from '../models/admin';

class AdminService {
  private adminRepository: AdminRepository;

  constructor(_adminRepository: AdminRepository) {
    this.adminRepository = _adminRepository;
  }

  async createAdmin(payload: Omit<IAdmin, '_id'>): Promise<IAdmin> {
    return await this.adminRepository.createAdmin(payload);
  }

  async getAdmin(filter: FilterQuery<IAdminModel>): Promise<IAdmin | null> {
    return await this.adminRepository.getAdmin(filter);
  }

  async findAllAdmins(filter?: FilterQuery<IAdminModel>): Promise<IAdmin[]> {
    return await this.adminRepository.findAllAdmins(filter);
  }

  async updateAdmin(filter: FilterQuery<IAdminModel>, payload: Partial<Omit<IAdmin, '_id'>>): Promise<IAdminModel | null> {
    return await this.adminRepository.updateAdmin(filter, payload);
  }

  async deleteAdmin(filter: FilterQuery<IAdminModel>): Promise<{ deletedCount: number }> {
    return await this.adminRepository.deleteAdmin(filter);
  }
}

export default AdminService;
