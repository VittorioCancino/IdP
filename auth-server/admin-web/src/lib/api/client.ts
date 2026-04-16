import { Err, Ok } from 'ts-results';
import type { Result } from 'ts-results';
import type { ApiError as SharedApiError } from '@/lib/types/api.types';

const BaseErrorValues = {
  InvalidPayload: 'Response payload is not valid JSON',
  NotFound: 'Resource not found',
  MissingToken: 'Token is required',
  HTTPError: 'Request failed with HTTP error',
  RequestError: 'There was an error with the request',
  UnexpectedError: 'An unexpected error occurred',
  Unauthorized: 'Unauthorized error',
} as const;

export type BaseError = (typeof BaseErrorValues)[keyof typeof BaseErrorValues];

export const BaseError = {
  ...BaseErrorValues,
  fromHttpStatus: (status: number): BaseError => {
    switch (status) {
      case 400:
        return BaseError.InvalidPayload;
      case 401:
        return BaseError.Unauthorized;
      case 404:
        return BaseError.NotFound;
      default:
        return BaseError.HTTPError;
    }
  },
} as const;

export type ApiError = SharedApiError;
export type ApiResult<T> = Result<T, ApiError>;

export const apiFetch = async (
  path: string,
  init?: RequestInit,
): Promise<Response> => {
  return fetch(path, init);
};

const hasMessage = (payload: unknown): payload is { message: string } => {
  if (typeof payload !== 'object' || payload === null) return false;
  return typeof (payload as { message?: unknown }).message === 'string';
};

const isRecord = (payload: unknown): payload is Record<string, unknown> => {
  return typeof payload === 'object' && payload !== null;
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const extractErrors = (payload: unknown): ApiError['errors'] => {
  if (!isRecord(payload)) return undefined;

  const errors: Record<string, string[] | undefined> = {};
  const rawErrors = payload.errors;

  if (isRecord(rawErrors)) {
    for (const [key, value] of Object.entries(rawErrors)) {
      if (value === undefined || isStringArray(value)) {
        errors[key] = value;
      }
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'message' || key === 'errors') continue;
    if (isStringArray(value)) errors[key] = value;
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
};

const toApiError = (payload: unknown, fallbackMessage: string): ApiError => ({
  message: hasMessage(payload) ? payload.message : fallbackMessage,
  errors: extractErrors(payload),
});

const parseJsonSafely = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export async function handleErrorResponse<T>(
  promise: Promise<Response>,
  handleOptions: { returnBody: true },
): Promise<ApiResult<T>>;
export async function handleErrorResponse(
  promise: Promise<Response>,
  handleOptions: { returnBody: false },
): Promise<ApiResult<true>>;
export async function handleErrorResponse<T>(
  promise: Promise<Response>,
  handleOptions?: { returnBody?: boolean },
): Promise<ApiResult<T>>;
export async function handleErrorResponse<T>(
  promise: Promise<Response>,
  handleOptions: { returnBody?: boolean } = { returnBody: true },
): Promise<ApiResult<T | true>> {
  try {
    const response = await promise;

    if (response.ok) {
      if (!handleOptions.returnBody) return Ok(true);

      const payload = await parseJsonSafely(response);
      if (payload === null) return Err({ message: BaseError.InvalidPayload });

      return Ok(payload as T);
    }

    const errorPayload = await parseJsonSafely(response);
    return Err(
      toApiError(
        errorPayload,
        hasMessage(errorPayload)
          ? errorPayload.message
          : BaseError.fromHttpStatus(response.status),
      ),
    );
  } catch (error) {
    if (error instanceof TypeError) {
      return Err({ message: BaseError.RequestError });
    }

    return Err({ message: BaseError.UnexpectedError });
  }
}
