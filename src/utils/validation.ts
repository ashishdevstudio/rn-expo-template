import { z } from 'zod';

export const requiredString = (message = 'This field is required') =>
  z.string().trim().min(1, message);

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email'));

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters');
