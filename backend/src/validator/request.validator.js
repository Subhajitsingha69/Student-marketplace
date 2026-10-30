import { z } from 'zod';

export const signupPostBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  username: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be no longer than 30 characters')
    .regex(/^[a-z0-9_.-]+$/, 'Username may only use letters, numbers, dots, underscores, or hyphens'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginPostBodySchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const feedLimitSchema = z.preprocess((value) => {
  if (value === undefined || value === '') return 10;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== 0 ? Math.min(Math.max(parsed, 1), 30) : 10;
}, z.number());

export const feedQuerySchema = z.object({
  limit: feedLimitSchema,
  cursor: z.string().optional(),
});
