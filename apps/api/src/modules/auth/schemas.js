import { z } from 'zod';

const normalizedEmail = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

const normalizedUsername = z
  .string()
  .trim()
  .min(3, 'Username must have at least 3 characters')
  .max(30, 'Username must have at most 30 characters')
  .regex(
    /^[a-z0-9_]+$/i,
    'Username can only contain letters, numbers, and underscores'
  )
  .transform((value) => value.toLowerCase());

const strongPassword = z
  .string()
  .min(8, 'Password must have at least 8 characters')
  .max(128, 'Password must have at most 128 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number');

export const registerSchema = z.object({
  email: normalizedEmail,
  username: normalizedUsername,
  fullName: z.string().trim().min(2).max(120),
  password: strongPassword
});

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(8).max(128)
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(10)
});
