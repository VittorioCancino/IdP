import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbError } from './db-error';

export interface DbHttpExceptionOptions {
  uniqueFields?: Record<string, string>;
  notFoundMessage?: string;
  defaultMessage?: string;
}

export function mapDbErrorToHttpException(
  dbError: DbError,
  options: DbHttpExceptionOptions = {},
): HttpException {
  if (dbError.kind !== 'prisma-known') {
    return new InternalServerErrorException(
      options.defaultMessage ?? 'Database operation failed',
    );
  }

  if (dbError.error.code === 'P2002') {
    const target = dbError.error.meta?.target;
    const field = Array.isArray(target) ? target[0] : undefined;
    const message =
      (field ? options.uniqueFields?.[field] : undefined) ??
      'A unique field already exists';

    return new ConflictException(message);
  }

  if (dbError.error.code === 'P2025') {
    return new NotFoundException(
      options.notFoundMessage ?? 'Related record was not found',
    );
  }

  return new InternalServerErrorException(
    options.defaultMessage ?? 'Database operation failed',
  );
}
