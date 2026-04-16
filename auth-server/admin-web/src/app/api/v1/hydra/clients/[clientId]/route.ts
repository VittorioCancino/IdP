import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { deleteHydraClient } from '@/lib/hydra/admin-client';
import type { ApiError } from '@/lib/types/api.types';
import { unauthorizedError, notFoundError, internalServerError } from '@/lib/util/api';
// ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
import { isAuthBypassed } from '@/lib/util/dev';

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
