'server-only';

import bcrypt from 'bcryptjs';
import { Ok, type Result } from 'ts-results';

import { prisma } from '@/lib/prisma';
import { safeDbCall, type DbError } from '@/lib/util/db';
import type { AdminUser } from '@/app/generated/prisma/client';
import type { SessionUser } from '@/lib/types/auth.types';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAdminUserByEmail(
  email: string,
): Promise<Result<AdminUser | null, DbError>> {
  return safeDbCall(() =>
    prisma.adminUser.findUnique({ where: { email: normalizeEmail(email) } }),
  );
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<Result<SessionUser | null, DbError>> {
  const result = await findAdminUserByEmail(email);

  if (result.err) return result;

  const user = result.val;

  if (!user) return Ok(null);

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) return Ok(null);

  return Ok({ id: user.id, email: user.email, name: user.name });
}
