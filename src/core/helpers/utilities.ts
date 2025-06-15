import { z } from 'zod';
import RequestValidationError from '../errors/RequestValidationError';

export const responseHandler = (payload: { [key: string]: any } | any[], message = 'success'): { status: boolean; message: string; data: any } => {
  return {
    status: true,
    message,
    data: payload || {}
  };
};

const buildZodErrorObject = (errors: z.ZodIssue[]): any => {
  const customErrors: any = {};

  errors.forEach((error) => {
    const path = error.path.join('.');

    if (!Object.prototype.hasOwnProperty.call(customErrors, path)) {
      customErrors[path] = {
        message: error.message,
        customErrorMessage: getZodErrorMessage(error)
      };
    }
  });

  return customErrors;
};

const getZodErrorMessage = (error: z.ZodIssue): string => {
  const path = error.path.join('.');

  switch (error.code) {
    case 'invalid_type':
      if (error.expected === 'string') {
        return `${path} should be a string`;
      }
      return `${path} has invalid type`;
    case 'too_small':
      if (error.type === 'string') {
        return `${path} should have at least ${error.minimum} characters!`;
      }
      return `${path} is too small`;
    case 'too_big':
      if (error.type === 'string') {
        return `${path} should have at most ${error.maximum} characters!`;
      }
      return `${path} is too big`;
    case 'invalid_string':
      if (error.validation === 'regex') {
        return `${path} should contain only alphanumeric characters`;
      }
      return `${path} has invalid format`;
    case 'custom':
      return error.message;
    default:
      return error.message;
  }
};

export const zodWrapperValidate = <T>(data: any, schema: z.ZodType<T>): { data: T } => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorData = buildZodErrorObject(result.error.errors);
    throw new RequestValidationError({
      message: 'Invalid input. Please double-check your input and try again.',
      reason: 'invalid request data',
      data: errorData
    });
  }

  return { data: result.data };
};

export const passwordValidator = z
  .string()
  .min(8)
  .max(50)
  .trim()
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).*/, {
    message: 'Password must include at least one uppercase character, one lowercase character, one special character, and one digit'
  });

/**
 * Generates a random alphanumeric string of the specified length
 * @param length Length of the string to generate
 * @returns Random alphanumeric string
 */
export function generateAlphanumericString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Generates a random integer with the specified number of digits
 * @param digits Number of digits in the integer
 * @returns Random integer
 */
export function generateRandomInteger(digits: number): number {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
