'server-only';

import { Prisma } from '@/app/generated/prisma/client';
import { type Result, Ok, Err } from 'ts-results';

export type DbError =
  | { isPrisma: true; error: Prisma.PrismaClientKnownRequestError }
  | { isPrisma: false; error: unknown };

export function dbErrorFromUnknown(error: unknown): DbError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return { isPrisma: true, error };
  }

  return { isPrisma: false, error };
}

export async function safeDbCall<T>(
  fn: () => Promise<T>,
): Promise<Result<T, DbError>> {
  try {
    return Ok(await fn());
  } catch (error) {
    return Err(dbErrorFromUnknown(error));
  }
}
