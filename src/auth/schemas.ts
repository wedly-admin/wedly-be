import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  brideFullName: z.string().min(1).optional(),
  groomFullName: z.string().min(1).optional(),
  weddingDate: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email(),
});
