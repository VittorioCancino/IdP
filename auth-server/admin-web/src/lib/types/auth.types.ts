import { z } from "zod";

export const LoginBodySchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;

export const SessionUserSchema = z.object({
  id: z.string().cuid(),
  email: z.email(),
  name: z.string().min(1),
});

export type SessionUser = z.infer<typeof SessionUserSchema>;
