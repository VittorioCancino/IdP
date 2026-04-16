import { Err } from 'ts-results';

import {
  apiFetch,
  handleErrorResponse,
  BaseError,
  type ApiResult,
} from '@/lib/api/client';
import type {
  CreateHydraClientBody,
  UpdateHydraClientBody,
  HydraClientSummary,
  HydraClientCreateResponse,
} from '@/lib/types/hydra-client.types';
import type { TokenIntrospectionResponse } from '@/lib/types/hydra-token.types';

export async function listHydraClients(): Promise<
  ApiResult<HydraClientSummary[]>
> {
  return handleErrorResponse<HydraClientSummary[]>(
    apiFetch('/api/v1/hydra/clients', { credentials: 'include' }),
    { returnBody: true },
  );
}

export async function introspectToken(
  token: string,
): Promise<ApiResult<TokenIntrospectionResponse>> {
  return handleErrorResponse<TokenIntrospectionResponse>(
    apiFetch('/api/v1/hydra/tokens/introspect', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }),
    { returnBody: true },
  );
}

export async function revokeHydraClientTokens(
  clientId: string,
): Promise<ApiResult<true>> {
  return handleErrorResponse(
    apiFetch(
      `/api/v1/hydra/clients/${encodeURIComponent(clientId)}/revoke-tokens`,
      { method: 'DELETE', credentials: 'include' },
    ),
    { returnBody: false },
  );
}

export async function rotateHydraClientSecret(
  clientId: string,
): Promise<ApiResult<HydraClientCreateResponse>> {
  return handleErrorResponse<HydraClientCreateResponse>(
    apiFetch(
      `/api/v1/hydra/clients/${encodeURIComponent(clientId)}/rotate-secret`,
      { method: 'POST', credentials: 'include' },
    ),
    { returnBody: true },
  );
}

export async function updateHydraClient(
  clientId: string,
  body: UpdateHydraClientBody,
): Promise<ApiResult<HydraClientCreateResponse>> {
  return handleErrorResponse<HydraClientCreateResponse>(
    apiFetch(`/api/v1/hydra/clients/${encodeURIComponent(clientId)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { returnBody: true },
  );
}

export async function getHydraClient(
  clientId: string,
): Promise<ApiResult<HydraClientCreateResponse>> {
  return handleErrorResponse<HydraClientCreateResponse>(
    apiFetch(`/api/v1/hydra/clients/${encodeURIComponent(clientId)}`, {
      credentials: 'include',
    }),
    { returnBody: true },
  );
}

export async function deleteHydraClient(
  clientId: string,
): Promise<ApiResult<true>> {
  return handleErrorResponse(
    apiFetch(`/api/v1/hydra/clients/${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
    { returnBody: false },
  );
}

export async function createHydraClient(
  body: CreateHydraClientBody,
): Promise<ApiResult<HydraClientCreateResponse>> {
  return handleErrorResponse<HydraClientCreateResponse>(
    apiFetch('/api/v1/hydra/clients', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { returnBody: true },
  );
}
