import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import settings from '../../core/config/application';
import TokenExpiredError from '../../core/errors/UnauthorizedError';
import ForbiddenError from '../../core/errors/ForbiddenError';
import { UserRepository } from '../../../src/core/repositories/UserRepository';
import { AdminRepository } from '../../../src/core/repositories/AdminRepository';

const userRepository = new UserRepository();
const adminRepository = new AdminRepository();

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenError({
        message: 'Authorization denied. No token provided'
      });
    }
    const decodedToken = jwt.verify(token, settings.jwt.access_token_secret_key) as JwtPayload;
    if (decodedToken && decodedToken._id) {
      const user = (await userRepository.getUser({ _id: decodedToken.id })) || (await adminRepository.getAdmin({ _id: decodedToken.id }));
      if (!user) {
        throw new ForbiddenError({ message: 'Authorization denied. User not found' });
      }
    }

    res.locals.user = decodedToken;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new TokenExpiredError({ message: 'Token has expired' }));
    } else {
      next(error);
    }
  }
};
