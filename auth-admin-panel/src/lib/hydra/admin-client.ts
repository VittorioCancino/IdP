'server-only';

import { randomBytes } from 'crypto';

import { type Result } from 'ts-results';

import {
  HydraClientSummarySchema,
  HydraClientCreateResponseSchema,
  type CreateHydraClientBody,
  type UpdateHydraClientBody,
  type HydraClientSummary,
  type HydraClientCreateResponse,
} from '@/lib/types/hydra-client.types';
import {
  TokenIntrospectionResponseSchema,
  type TokenIntrospectionResponse,
} from '@/lib/types/hydra-token.types';
import {
  safeHydraCall,
  HydraHttpError,
  type HydraError,
} from '@/lib/util/hydra';

function generateClientSecret(): string {
  return randomBytes(64).toString('hex');
}

function getHydraAdminUrl(): string {
  const url = process.env.HYDRA_ADMIN_URL;

  if (!url) throw new Error('Missing HYDRA_ADMIN_URL environment variable.');

  return url.replace(/\/$/, '');
}

async function hydraFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${getHydraAdminUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      (body as { error?: string } | null)?.error ??
      `Hydra admin request failed with status ${response.status}.`;
    throw new HydraHttpError(response.status, message);
  }

  return response;
}

export async function listHydraClients(): Promise<
  Result<HydraClientSummary[], HydraError>
> {
  return safeHydraCall(async () => {
    const response = await hydraFetch('/admin/clients');
    const payload = await response.json();
    return HydraClientSummarySchema.array().parse(payload);
  });
}

export async function introspectToken(
  token: string,
): Promise<Result<TokenIntrospectionResponse, HydraError>> {
  return safeHydraCall(async () => {
    const body = new URLSearchParams({ token });
    const response = await hydraFetch('/admin/oauth2/introspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const payload = await response.json();
    return TokenIntrospectionResponseSchema.parse(payload);
  });
}

export async function deleteHydraClient(
  clientId: string,
): Promise<Result<true, HydraError>> {
  return safeHydraCall(async () => {
    await hydraFetch(`/admin/clients/${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
    });
    return true as const;
  });
}

export async function revokeHydraClientTokens(
  clientId: string,
): Promise<Result<true, HydraError>> {
  return safeHydraCall(async () => {
    await hydraFetch(
      `/admin/oauth2/tokens?client_id=${encodeURIComponent(clientId)}`,
      { method: 'DELETE' },
    );
    return true as const;
  });
}

export async function rotateHydraClientSecret(
  clientId: string,
): Promise<Result<HydraClientCreateResponse, HydraError>> {
  return safeHydraCall(async () => {
    const response = await hydraFetch(
      `/admin/clients/${encodeURIComponent(clientId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { op: 'replace', path: '/client_secret', value: generateClientSecret() },
        ]),
      },
    );
    const payload = await response.json();
    return HydraClientCreateResponseSchema.parse(payload);
  });
}

export async function updateHydraClient(
  clientId: string,
  input: UpdateHydraClientBody,
): Promise<Result<HydraClientCreateResponse, HydraError>> {
  return safeHydraCall(async () => {
    const response = await hydraFetch(
      `/admin/clients/${encodeURIComponent(clientId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_name: input.client_name,
          grant_types: ['client_credentials'],
          response_types: [],
          scope: input.scope,
          audience: input.audience.split(' ').filter(Boolean),
          token_endpoint_auth_method: input.token_endpoint_auth_method,
        }),
      },
    );
    const updated = await response.json();
    return HydraClientCreateResponseSchema.parse(updated);
  });
}

export async function getHydraClient(
  clientId: string,
): Promise<Result<HydraClientCreateResponse, HydraError>> {
  return safeHydraCall(async () => {
    const response = await hydraFetch(
      `/admin/clients/${encodeURIComponent(clientId)}`,
    );
    const payload = await response.json();
    return HydraClientCreateResponseSchema.parse(payload);
  });
}

export async function createHydraClient(
  input: CreateHydraClientBody,
): Promise<Result<HydraClientCreateResponse, HydraError>> {
  return safeHydraCall(async () => {
    const response = await hydraFetch('/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: input.client_id,
        client_name: input.client_name,
        client_secret: generateClientSecret(),
        grant_types: ['client_credentials'],
        response_types: [],
        scope: input.scope,
        audience: input.audience.split(' ').filter(Boolean),
        token_endpoint_auth_method: input.token_endpoint_auth_method,
      }),
    });

    const created = await response.json();
    return HydraClientCreateResponseSchema.parse(created);
  });
}
