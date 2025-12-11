import * as z from 'zod';

export const createEmailSchema = z.object({
  token: z.string(),
  email: z.email(),
});

export const statusSchema = z.object({
  error: z.string().optional(),
  success: z.boolean().optional(),
});
