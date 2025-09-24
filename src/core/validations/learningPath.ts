import z from 'zod';

export const learningPathCreationSchema = z.object({
  stack: z.string().trim().min(1, 'Stack is required').max(50, 'Stack must be at most 50 characters long'),
  Instructor: z.string().trim().min(1, 'Instructor is required').max(100, 'Instructor must be at most 100 characters long')
});

export const lessonSchema = z.object({
  week: z
    .number()
    .int()
    .positive('Week must be a positive integer')
    .refine((n) => Number.isInteger(n), { message: 'Week must be an integer' }),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().trim().min(1, 'Description is required')
});

export const bulkLessonsSchema = z
  .array(lessonSchema)
  .nonempty('At least one lesson is required')
  .max(50, 'Maximum 50 lessons can be uploaded at once');

export const combinedCreationSchema = learningPathCreationSchema.merge(lessonSchema);

export const learningPathUpdateSchema = combinedCreationSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});
