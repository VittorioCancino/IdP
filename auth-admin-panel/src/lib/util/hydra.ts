'server-only';

import { type Result, Ok, Err } from 'ts-results';

export type HydraError =
  | { isHttpError: true; status: number; message: string }
  | { isHttpError: false; error: unknown };

export function hydraErrorFromResponse(status: number, message: string): HydraError {
  return { isHttpError: true, status, message };
}

export function hydraErrorFromUnknown(error: unknown): HydraError {
  return { isHttpError: false, error };
}

export async function safeHydraCall<T>(
  fn: () => Promise<T>,
): Promise<Result<T, HydraError>> {
  try {
    return Ok(await fn());
  } catch (error) {
    if (error instanceof HydraHttpError) {
      return Err(hydraErrorFromResponse(error.status, error.message));
    }

    return Err(hydraErrorFromUnknown(error));
  }
}

export class HydraHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HydraHttpError';
  }
}
