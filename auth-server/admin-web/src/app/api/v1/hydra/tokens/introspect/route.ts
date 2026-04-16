import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { introspectToken } from '@/lib/hydra/admin-client';
import { IntrospectTokenBodySchema } from '@/lib/types/hydra-token.types';
import type { TokenIntrospectionResponse } from '@/lib/types/hydra-token.types';
import type { ApiError } from '@/lib/types/api.types';
import { unauthorizedError, internalServerError, parseJsonBody } from '@/lib/util/api';
// ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
import { isAuthBypassed } from '@/lib/util/dev';

export async function POST(
  request: Request,
): Promise<NextResponse<ApiError> | NextResponse<TokenIntrospectionResponse>> {
  // ⚠️  TODO: REMOVE BEFORE PRODUCTION — dev auth bypass
  if (!isAuthBypassed()) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(unauthorizedError(), { status: 401 });
    }
  }

  const bodyResult = await parseJsonBody(request, IntrospectTokenBodySchema);
  if (bodyResult.err) return bodyResult.val;

  const result = await introspectToken(bodyResult.val.token);

  if (result.err) {
    console.error('Failed to introspect token.', result.val);
    return NextResponse.json(internalServerError(), { status: 500 });
  }

  return NextResponse.json(result.val);
}
