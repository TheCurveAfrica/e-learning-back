import { z } from 'zod';
import { RequestHandler } from 'express';
import { zodWrapperValidate } from './utilities';

export enum SEGMENT {
  BODY = 'body',
  COOKIES = 'cookies',
  HEADERS = 'headers',
  PARAMS = 'params',
  QUERY = 'query'
}

/* eslint-disable indent */
export const validationWrapper =
  (segment: SEGMENT, schema: z.ZodType<any>): RequestHandler =>
  (req, _res, next): void => {
    try {
      // Handle the case where req[segment] might be undefined
      if (req[segment] === undefined) {
        req[segment] = {};
      }

      const { data } = zodWrapperValidate(req[segment], schema);
      req[segment] = data;
      next();
    } catch (error) {
      console.error(`Validation error in ${segment}:`, error);
      next(error);
    }
  };
