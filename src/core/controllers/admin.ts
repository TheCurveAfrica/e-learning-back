import bcrypt from 'bcrypt';
import BadRequestError from '../errors/BadRequestError';
import { IAdmin } from '../interfaces/auth';
import { AdminRepository } from '../repositories/AdminRepository';
import { generateAlphanumericString } from '../helpers/utilities';
import EmailService from '../services/email';

class AdminController {
  private adminRepository: AdminRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async register(body: Omit<IAdmin, '_id'>): Promise<Omit<IAdmin, 'password'>> {
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.getAdmin({ email: body.email });
    if (existingAdmin) {
      throw new BadRequestError({ message: 'Admin already exists', reason: 'Admin already registered' });
    }

    // Generate password if not provided
    let plainPassword = body.password;
    if (!plainPassword) {
      plainPassword = generateAlphanumericString(12);
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(plainPassword, salt);

    // Create admin
    const newAdmin = await this.adminRepository.createAdmin({
      ...body,
      password: hashedPassword
    });

    // Send password to email if it was generated
    if (!body.password) {
      await EmailService.sendAdminPasswordEmail({
        to: newAdmin.email,
        name: newAdmin.firstname,
        password: plainPassword
      });
    }

    // Return admin data without password
    const { password, ...adminData } = newAdmin;
    return adminData;
  }
}

export default AdminController;
