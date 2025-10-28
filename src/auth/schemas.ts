import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const GoogleIdSchema = z.object({
  credential: z.string().min(20),
});

