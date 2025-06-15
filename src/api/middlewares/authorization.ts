// import { Request, Response, NextFunction } from 'express';
// import ForbiddenError from '../../core/errors/ForbiddenError';
// import { UserRepository } from '../../../src/core/repositories/UserRepository';
// import settings from '../../../src/core/config/application';
// import UserService from '../../../src/core/services/user';

// const userService = new UserService(new UserRepository());

// export const adminAuthorization = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const user = await userService.getUser({ id: res.locals.user.id });
//     if (!user) {
//       throw new ForbiddenError({ message: 'Authorization denied. User not found' });
//     }

//     if (user.roleId !== Number(settings.admin_role_id)) {
//       throw new ForbiddenError({ message: `Authorization denied. Only admins can perform this action` });
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// };
