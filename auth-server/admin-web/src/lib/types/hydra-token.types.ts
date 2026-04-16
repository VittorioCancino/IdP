import { z } from 'zod';

export const IntrospectTokenBodySchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
});

export type IntrospectTokenBody = z.infer<typeof IntrospectTokenBodySchema>;

export const TokenIntrospectionResponseSchema = z.object({
  active: z.boolean(),
  client_id: z.string().optional(),
  sub: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
  token_use: z.string().optional(),
  iss: z.string().optional(),
  aud: z.array(z.string()).default([]),
  iat: z.number().optional(),
  exp: z.number().optional(),
  nbf: z.number().optional(),
});

export type TokenIntrospectionResponse = z.infer<typeof TokenIntrospectionResponseSchema>;
