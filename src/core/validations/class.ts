import z from 'zod';
import { STACK } from '../constants/user';

export const classCreationSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(50, 'title must be at most 50 characters long'),
  description: z.string().trim().min(1, 'description is required'),
  startDate: z.string().trim().min(1, 'startDate is required').max(10, 'startDate must be at most 10 characters long'),
  startTime: z.string().min(1, 'startTime is required').max(15, 'startTime must be at most 15 characters long'),
  endTime: z.string().min(1, 'endTime is required').max(15, 'endTime must be at most 15 characters long'),
  stack: z.nativeEnum(STACK).transform((val) => val.toLowerCase()),
  location: z.string().trim().min(1, 'location is required').max(50, 'location must be at most 50 characters long'),
  classLink: z.string().trim().url('classLink must be a valid URL')
});

export const recordedClassCreationSchema = z.object({
  title: z.string().trim().min(1, 'title is required').max(50, 'title must be at most 50 characters long'),
  description: z.string().trim().min(1, 'description is required'),
  date: z.string().trim().min(1, 'Date is required').max(10, 'Date must be at most 10 characters long'),
  stack: z.nativeEnum(STACK).transform((val) => val.toLowerCase()),
  videoLink: z.string().trim().url('videoLink must be a valid URL')
});

export const combinedCreationSchema = classCreationSchema.merge(recordedClassCreationSchema);

export const classUpdateSchema = combinedCreationSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
