import { FilterQuery, UpdateQuery } from 'mongoose';
import { IUser } from '../interfaces/auth';
import { IUserModel, User } from '../models/user';
import { IUserRepository } from '../interfaces/repository/IUserRepository';

export class UserRepository implements IUserRepository {
  async createUser(payload: Omit<IUser, '_id'>): Promise<IUser> {
    const user = await User.create(payload);
    return this.convertToIUser(user);
  }

  async findOrCreateUser(filter: FilterQuery<IUserModel>, payload: Omit<IUser, 'id'>): Promise<{ user: IUser; created: boolean }> {
    const existingUser = await User.findOne(filter);

    if (existingUser) {
      return {
        user: this.convertToIUser(existingUser),
        created: false
      };
    }

    const newUser = await User.create(payload);
    return {
      user: this.convertToIUser(newUser),
      created: true
    };
  }

  async getUser(filter: FilterQuery<IUserModel>): Promise<IUser | null> {
    const user = await User.findOne(filter);
    return user ? this.convertToIUser(user) : null;
  }

  async findUserById(id: string): Promise<IUser | null> {
    const user = await User.findById(id);
    return user ? this.convertToIUser(user) : null;
  }

  async findAllUsers(filter: FilterQuery<IUserModel> = {}): Promise<IUser[]> {
    const users = await User.find(filter).sort({ createdAt: -1 });
    return users.map((user) => this.convertToIUser(user));
  }

  async updateUser(filter: FilterQuery<IUserModel>, payload: UpdateQuery<IUserModel>): Promise<IUserModel | null> {
    return await User.findOneAndUpdate(filter, payload, { new: true });
  }

  async deleteUser(filter: FilterQuery<IUserModel>): Promise<{ deletedCount: number }> {
    const result = await User.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  async countUser(filter: FilterQuery<IUserModel>): Promise<number> {
    return await User.countDocuments(filter);
  }

  async getUserWithRole(filter: FilterQuery<IUserModel>): Promise<IUser | null> {
    // This is a placeholder - in a real implementation, you would use populate
    // to include role information if you have a separate Role model
    // For example: const user = await User.findOne(filter).populate('role');
    const user = await User.findOne(filter);
    return user ? this.convertToIUser(user) : null;
  }

  async bulkCreateUsers(users: Omit<IUser, 'id'>[]): Promise<IUser[]> {
    const createdUsers = await User.insertMany(users);
    return createdUsers.map((user) => this.convertToIUser(user));
  }

  private convertToIUser(user: IUserModel): IUser {
    return {
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      phone: user.phone,
      gender: user.gender,
      isEmailVerified: user.isEmailVerified,
      stack: user.stack,
      status: user.status,
      role: user.role,
      bio: user.bio
    };
  }
}
