import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  deleteHydraClient,
  getHydraClient,
  updateHydraClient,
} from '@/lib/hydra/admin-client';
import type { ApiError } from '@/lib/types/api.types';
import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';
import { UpdateHydraClientBodySchema } from '@/lib/types/hydra-client.types';
import {
  unauthorizedError,
  notFoundError,
  internalServerError,
  parseJsonBody,
} from '@/lib/util/api';
// ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
import { isAuthBypassed } from '@/lib/util/dev';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
): Promise<NextResponse<ApiError> | NextResponse<HydraClientCreateResponse>> {
  // ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
  if (!isAuthBypassed()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(unauthorizedError(), { status: 401 });
    }
  }

  const { clientId } = await params;

  const result = await getHydraClient(clientId);

  if (result.err) {
    const err = result.val;
    if (err.isHttpError && err.status === 404) {
      return NextResponse.json(notFoundError('Client'), { status: 404 });
    }
    console.error('Failed to fetch Hydra client.', err);
    return NextResponse.json(internalServerError(), { status: 500 });
  }

  return NextResponse.json(result.val);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> },
): Promise<NextResponse<ApiError> | NextResponse<HydraClientCreateResponse>> {
  // ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
  if (!isAuthBypassed()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(unauthorizedError(), { status: 401 });
    }
  }

  const { clientId } = await params;

  const bodyResult = await parseJsonBody(request, UpdateHydraClientBodySchema);
  if (bodyResult.err) return bodyResult.val;

  const result = await updateHydraClient(clientId, bodyResult.val);

  if (result.err) {
    const err = result.val;
    if (err.isHttpError && err.status === 404) {
      return NextResponse.json(notFoundError('Client'), { status: 404 });
    }
    console.error('Failed to update Hydra client.', err);
    return NextResponse.json(internalServerError(), { status: 500 });
  }

  return NextResponse.json(result.val);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> },
): Promise<NextResponse<ApiError> | NextResponse<true>> {
  // ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
  if (!isAuthBypassed()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(unauthorizedError(), { status: 401 });
    }
  }

  const { clientId } = await params;

  const result = await deleteHydraClient(clientId);

  if (result.err) {
    const err = result.val;
    if (err.isHttpError && err.status === 404) {
      return NextResponse.json(notFoundError('Client'), { status: 404 });
    }
    console.error('Failed to delete Hydra client.', err);
    return NextResponse.json(internalServerError(), { status: 500 });
  }

  return NextResponse.json(true);
}
