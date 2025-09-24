import { Request, Response, NextFunction } from 'express';
import ForbiddenError from '../../core/errors/ForbiddenError';
import { AdminRepository } from '../../../src/core/repositories/AdminRepository';
import AdminService from '../../../src/core/services/admin';

const adminService = new AdminService(new AdminRepository());

export const authorize = (...roles: string[]): any => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await adminService.getAdmin({ _id: res.locals.user.id });
    if (!user) {
      throw new ForbiddenError({ message: 'Authorization denied. User not found' });
    }

    if (roles.length && !roles.includes(user.role)) {
      throw new ForbiddenError({ message: 'You do not have permission to perform this action.' });
    }

    next();
  };
};
