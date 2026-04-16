'server-only';

import { Ok, Err, type Result } from 'ts-results';
import type { ApiError } from '@/lib/types/api.types';
import * as z from 'zod';
import { NextResponse } from 'next/server';

export const DEFAULT_JSON_PARSING_ERROR: ApiError = {
  message: 'Error parsing body',
  errors: {
    body: ['Invalid JSON'],
  },
};

export function fromZodError<T>(
  error: z.ZodError<T>,
  payloadType?: 'body' | 'query' | 'params',
): ApiError {
  const fieldErrors = z.flattenError(error).fieldErrors;
  let message = 'Invalid request body';
  if (payloadType) {
    switch (payloadType) {
      case 'query':
        message = 'Invalid request query';
        break;
      case 'params':
        message = 'Invalid request params';
        break;
      case 'body':
      default:
        break;
    }
  }
  return { message, errors: fieldErrors };
}

export function unauthorizedError(): ApiError {
  return { message: 'Unauthorized', errors: {} };
}

export function notFoundError(resource?: string): ApiError {
  return {
    message: resource ? `${resource} not found` : 'Not found',
    errors: {},
  };
}

export function alreadyExistsError(field?: string): ApiError {
  const errors: Record<string, string[]> = {};
  if (field) errors[field] = ['Already exists'];
  return { message: 'Already exists', errors };
}

export function internalServerError(): ApiError {
  return { message: 'Internal server error', errors: {} };
}

export function customError(
  message: string,
  errors?: Record<string, string[] | undefined>,
): ApiError {
  return { message, errors: errors ?? {} };
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<Result<T, NextResponse<ApiError>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Err(NextResponse.json(DEFAULT_JSON_PARSING_ERROR, { status: 400 }));
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Err(NextResponse.json(fromZodError(parsed.error), { status: 400 }));
  }

  return Ok(parsed.data);
}

export function parseQueryParams<T>(
  request: Request,
  schema: z.ZodType<T>,
): Result<T, NextResponse<ApiError>> {
  const searchParams = new URL(request.url).searchParams;
  const record: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!Object.hasOwn(record, key)) {
      record[key] = value;
      continue;
    }

    const existing = record[key];
    record[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }

  const parsed = schema.safeParse(record);
  if (!parsed.success) {
    return Err(
      NextResponse.json(fromZodError(parsed.error, 'query'), { status: 400 }),
    );
  }

  return Ok(parsed.data);
}
