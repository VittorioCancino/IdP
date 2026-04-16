import { z } from "zod";

const nullableArray = z.preprocess(
  (v) => v ?? [],
  z.array(z.string()),
);

export const HydraClientSummarySchema = z.object({
  client_id: z.string(),
  client_name: z.string().optional(),
  grant_types: nullableArray,
  redirect_uris: nullableArray,
  response_types: nullableArray,
  scope: z.string().optional(),
  token_endpoint_auth_method: z.string().optional(),
});

export type HydraClientSummary = z.infer<typeof HydraClientSummarySchema>;

export const HydraClientCreateResponseSchema = z.object({
  client_id: z.string(),
  client_name: z.string().optional(),
  client_secret: z.string().optional(),
  client_secret_expires_at: z.number().optional(),
  scope: z.string().optional(),
  grant_types: nullableArray,
  response_types: nullableArray,
  redirect_uris: nullableArray,
  token_endpoint_auth_method: z.string().optional(),
  audience: nullableArray,
  owner: z.string().optional(),
  client_uri: z.string().optional(),
  allowed_cors_origins: nullableArray,
  contacts: nullableArray,
  metadata: z.unknown().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type HydraClientCreateResponse = z.infer<typeof HydraClientCreateResponseSchema>;

export const CreateHydraClientBodySchema = z.object({
  client_id: z.string().trim().min(1, "Client ID is required"),
  client_name: z.string().trim().min(1, "Client name is required"),
  scope: z.string().trim().default(""),
  token_endpoint_auth_method: z
    .enum(["client_secret_basic", "client_secret_post"])
    .default("client_secret_basic"),
});

export type CreateHydraClientBody = z.infer<typeof CreateHydraClientBodySchema>;
