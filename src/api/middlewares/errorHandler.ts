import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import DomainError from '../../core/errors/DomainError';
import { JsonWebTokenError } from 'jsonwebtoken';
import { logger } from '../../core/utils/logger';
import { Errors } from '../../core/constants/errors';

function handleErrors(err: Error, _req: Request, res: Response, _next: NextFunction): Response {
  console.error('Error caught by error handler:', err);

  if (err instanceof DomainError) {
    return res.status(err.getHttpCode()).send({
      status: err.getStatus(),
      error: err.getName(),
      message: err.message,
      reason: err.getReason(),
      data: err.getData ? err.getData() || {} : {}
    });
  }

  if (err instanceof MongooseError.ValidationError) {
    const errors: Record<string, string[]> = {};

    for (const key in err.errors) {
      if (Object.prototype.hasOwnProperty.call(err.errors, key)) {
        errors[key] = [err.errors[key].message];
      }
    }

    logger.error('[Mongoose Validation Error] => ', err);

    return res.status(422).send({
      error: 'validation_error',
      message: 'The provided payload was not valid',
      data: errors
    });
  }

  if (err instanceof MongooseError.CastError) {
    return res.status(400).send({
      error: 'bad_request',
      message: `Invalid value for ${err.path}: ${err.value}`,
      data: {}
    });
  }

  if ((err as any).code === 11000) {
    // Safely handle MongoDB duplicate key errors
    try {
      const keyValue = (err as any).keyValue;
      if (keyValue && typeof keyValue === 'object') {
        const field = Object.keys(keyValue)[0];
        return res.status(409).send({
          error: 'duplicate_key',
          message: `${field} already exists.`,
          data: {}
        });
      }
    } catch (innerError) {
      console.error('Error handling duplicate key error:', innerError);
    }

    // Fallback if we couldn't extract the field name
    return res.status(409).send({
      error: 'duplicate_key',
      message: 'A duplicate key error occurred.',
      data: {}
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(498).json({
      status: false,
      message: 'Invalid Token',
      data: null
    });
  }

  logger.error('[Unhandled Error] => ', err);
  return res.status(500).send({
    status: false,
    error: 'server_error',
    message: Errors.SERVER_ERROR,
    data: {}
  });
}

export { handleErrors };
