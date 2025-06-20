// filepath: /Users/isaac/e-learning-back/src/core/interfaces/repository/IUserRepository.ts
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { IUser } from '../auth';
import { IUserModel } from '../../models/user';

export interface IUserRepository {
  createUser(payload: Omit<IUser, '_id'>, options?: QueryOptions): Promise<IUser>;
  findOrCreateUser(filter: FilterQuery<IUserModel>, payload: Omit<IUser, '_id'>): Promise<{ user: IUser; created: boolean }>;
  getUser(filter: FilterQuery<IUserModel>): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  findAllUsers(filter?: FilterQuery<IUserModel>): Promise<IUser[]>;
  allUsers(): Promise<IUser[]>;
  updateUser(filter: FilterQuery<IUserModel>, payload: UpdateQuery<IUserModel>): Promise<{ modifiedCount: number }>;
  deleteUser(filter: FilterQuery<IUserModel>): Promise<{ deletedCount: number }>;
  countUser(filter: FilterQuery<IUserModel>): Promise<number>;
  bulkCreateUsers(users: Omit<IUser, '_id'>[]): Promise<IUser[]>;
}
