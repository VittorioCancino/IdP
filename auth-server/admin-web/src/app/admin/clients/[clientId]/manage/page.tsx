import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';
import EditClientForm from '@/components/EditClientForm';
import RotateSecretCard from '@/components/RotateSecretCard';
import RevokeTokensCard from '@/components/RevokeTokensCard';

async function getClient(clientId: string): Promise<HydraClientCreateResponse> {
  const baseUrl = process.env.AUTH_URL ?? 'http://localhost:3000';
  const requestHeaders = await headers();
  const response = await fetch(
    `${baseUrl}/api/v1/hydra/clients/${encodeURIComponent(clientId)}`,
    {
      cache: 'no-store',
      headers: {
        Cookie: requestHeaders.get('cookie') ?? '',
      },
    },
  );

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Failed to fetch Hydra client.');

  return response.json();
}

export default async function ClientManagePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  const displayName = client.client_name ?? client.client_id;

  return (
    <div className="grid gap-6">
      <Link
        href={`/admin/clients/${encodeURIComponent(clientId)}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-neutral hover:text-carbon-black"
      >
        ← Back to {displayName}
      </Link>

      {/* Header */}
      <section className="rounded-3xl border border-turquoise-surf bg-white p-6 sm:p-8">
        <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.22em] text-cerulean/70">
          Manage Client
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-carbon-black">
          {displayName}
        </h3>
        {client.client_name && (
          <p className="mt-1 font-[var(--font-geist-mono)] text-sm text-neutral/60">
            {client.client_id}
          </p>
        )}
      </section>

      {/* Action cards */}
      <div className="grid gap-4">

        {/* Edit Client */}
        <EditClientForm client={client} />

        {/* Rotate Secret */}
        <RotateSecretCard
          clientId={client.client_id}
          clientName={client.client_name}
        />

        {/* Revoke Tokens */}
        <RevokeTokensCard
          clientId={client.client_id}
          clientName={client.client_name}
        />

      </div>
    </div>
  );
}
