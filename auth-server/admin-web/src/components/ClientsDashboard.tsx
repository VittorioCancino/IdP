'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { deleteHydraClient } from '@/lib/api/hydra-clients';
import type { HydraClientSummary } from '@/lib/types/hydra-client.types';
import DeleteClientModal from '@/components/DeleteClientModal';

type PendingDelete = { clientId: string; clientName: string | undefined };

export default function ClientsDashboard({
  initialClients,
}: {
  initialClients: HydraClientSummary[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const machineClients = clients.filter((c) =>
    c.grant_types.includes('client_credentials'),
  ).length;
  const publicClients = clients.filter(
    (c) => c.token_endpoint_auth_method === 'none',
  ).length;

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    const { clientId } = pendingDelete;
    setDeletingId(clientId);
    setError(null);

    const result = await deleteHydraClient(clientId);

    setDeletingId(null);
    setPendingDelete(null);

    if (result.err) {
      setError(`Failed to delete "${clientId}": ${result.val.message}`);
      return;
    }

    setClients((prev) => prev.filter((c) => c.client_id !== clientId));
  }

  return (
    <>
      {pendingDelete && (
        <DeleteClientModal
          clientId={pendingDelete.clientId}
          clientName={pendingDelete.clientName}
          isDeleting={deletingId === pendingDelete.clientId}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Clients" value={clients.length} />
        <StatCard label="Machine Clients" value={machineClients} />
        <StatCard label="Public Clients" value={publicClients} />
      </div>

      {/* Clients table */}
      <div className="mt-8">
        <section className="rounded-3xl border border-turquoise-surf bg-white">
          <div className="flex items-center justify-between border-b border-turquoise-surf px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-carbon-black">
                Registered Clients
              </h3>
              <p className="mt-1 text-sm text-neutral">
                Live data from the Hydra admin endpoint.
              </p>
            </div>
            <span className="rounded-full bg-ghost-white px-3 py-1 text-xs font-medium text-neutral">
              {clients.length} records
            </span>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {clients.length === 0 ? (
            <div className="p-6 text-sm text-neutral">No Hydra clients found.</div>
          ) : (
            <ul className="divide-y divide-turquoise-surf">
              {clients.map((client) => (
                <li
                  key={client.client_id}
                  className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.4fr)_0.9fr_0.8fr_auto] lg:items-center"
                >
                  <div>
                    <p className="font-medium text-carbon-black">
                      {client.client_name || client.client_id}
                    </p>
                    <p className="mt-1 font-[var(--font-geist-mono)] text-sm text-cerulean/70">
                      {client.client_id}
                    </p>
                  </div>

                  <div className="text-sm text-neutral">
                    <p className="font-medium text-carbon-black">Grant Types</p>
                    <p className="mt-1">
                      {client.grant_types.length > 0
                        ? client.grant_types.join(', ')
                        : 'None'}
                    </p>
                  </div>

                  <div className="text-sm text-neutral">
                    <p className="font-medium text-carbon-black">Auth Method</p>
                    <p className="mt-1">
                      {client.token_endpoint_auth_method ?? 'Not set'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/clients/${encodeURIComponent(client.client_id)}`)}
                      className="rounded-xl border border-turquoise-surf px-3 py-2 text-sm text-carbon-black"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/clients/${encodeURIComponent(client.client_id)}/manage`)}
                      className="rounded-xl border border-turquoise-surf px-3 py-2 text-sm text-carbon-black"
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          clientId: client.client_id,
                          clientName: client.client_name,
                        })
                      }
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-turquoise-surf bg-white p-5">
      <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-carbon-black">{value}</p>
    </div>
  );
}
