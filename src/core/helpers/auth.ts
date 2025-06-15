import jwt from 'jsonwebtoken';
import settings from '../config/application';
import { BadRequestError } from '../errors';

export const generateAccessJwtToken = (data: { id: string; email: string; roleId?: string }): string => {
  const token = jwt.sign(
    {
      id: data.id,
      email: data.email
    },
    settings.jwt.access_token_secret_key,
    { expiresIn: settings.jwt.access_token_expires_in } as jwt.SignOptions
  );
  return token;
};

export const generateRefreshJwtToken = (data: { id: string }): string => {
  const token = jwt.sign(
    {
      id: data.id
    },
    settings.jwt.refresh_token_secret_key,
    { expiresIn: settings.jwt.refresh_token_expires_in } as jwt.SignOptions
  );
  return token;
};

export const verifyJwtAccessToken = (token: string): { id: string; email: string; roleId?: string } => {
  try {
    const decoded = jwt.verify(token, settings.jwt.access_token_secret_key) as { id: string; email: string; roleId?: string };
    return decoded;
  } catch (error) {
    throw new BadRequestError({ message: 'Invalid token', data: error });
  }
};
export const verifyJwtRefreshToken = (token: string): { id: string } => {
  try {
    const decoded = jwt.verify(token, settings.jwt.access_token_secret_key) as { id: string };
    return decoded;
  } catch (error) {
    throw new BadRequestError({ message: 'Invalid token', data: error });
  }
};
