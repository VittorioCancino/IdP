import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';

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

  if (!response.ok) {
    throw new Error('Failed to fetch Hydra client.');
  }

  return response.json();
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClient(clientId);

  const scopes = client.scope?.split(' ').filter(Boolean) ?? [];
  const isMachine = client.grant_types.includes('client_credentials');

  return (
    <div className="grid gap-6">
      <Link
        href="/admin/clients"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-neutral hover:text-carbon-black"
      >
        ← Back to Clients
      </Link>

      {/* Header card */}
      <section className="flex flex-col gap-4 rounded-3xl border border-turquoise-surf bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.22em] text-cerulean/70">
            OAuth 2.0 Client
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-carbon-black">
            {client.client_name ?? client.client_id}
          </h3>
          {client.client_name && (
            <p className="mt-1 font-[var(--font-geist-mono)] text-sm text-neutral/60">
              {client.client_id}
            </p>
          )}
        </div>

        <span
          className={`w-fit shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium ${
            isMachine
              ? 'bg-turquoise-surf text-cerulean'
              : 'bg-ghost-white text-neutral'
          }`}
        >
          {isMachine ? 'Machine Client' : 'Public Client'}
        </span>
      </section>

      {/* Details grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">

        {/* Configuration card */}
        <section className="rounded-3xl border border-turquoise-surf bg-white p-6 sm:p-8">
          <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
            Configuration
          </p>

          <div className="mt-5 grid gap-4">
            {scopes.length > 0 && (
              <InsetField label="Scopes">
                <div className="flex flex-wrap gap-2">
                  {scopes.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-turquoise-surf px-2.5 py-0.5 text-sm font-medium text-cerulean"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </InsetField>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <InsetField label="Grant Types">
                <div className="flex flex-wrap gap-2">
                  {client.grant_types.length > 0 ? (
                    client.grant_types.map((g) => (
                      <span
                        key={g}
                        className="rounded-lg border border-turquoise-surf px-2.5 py-0.5 text-sm text-carbon-black"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-neutral">None</span>
                  )}
                </div>
              </InsetField>

              <InsetField label="Auth Method">
                <span className="text-sm text-carbon-black">
                  {client.token_endpoint_auth_method ?? '—'}
                </span>
              </InsetField>
            </div>

            {client.response_types.length > 0 && (
              <InsetField label="Response Types">
                <div className="flex flex-wrap gap-2">
                  {client.response_types.map((r) => (
                    <span
                      key={r}
                      className="rounded-lg border border-turquoise-surf px-2.5 py-0.5 text-sm text-carbon-black"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </InsetField>
            )}

            <InsetField label="Audience">
              {client.audience.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.audience.map((a) => (
                    <span
                      key={a}
                      className="rounded-lg border border-turquoise-surf px-2.5 py-0.5 text-sm text-carbon-black"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-neutral">No restrictions</span>
              )}
            </InsetField>

            {client.redirect_uris.length > 0 && (
              <InsetField label="Redirect URIs">
                <ul className="grid gap-1">
                  {client.redirect_uris.map((uri) => (
                    <li
                      key={uri}
                      className="break-all font-[var(--font-geist-mono)] text-sm text-carbon-black"
                    >
                      {uri}
                    </li>
                  ))}
                </ul>
              </InsetField>
            )}

            {client.allowed_cors_origins.length > 0 && (
              <InsetField label="Allowed CORS Origins">
                <ul className="grid gap-1">
                  {client.allowed_cors_origins.map((origin) => (
                    <li
                      key={origin}
                      className="break-all font-[var(--font-geist-mono)] text-sm text-carbon-black"
                    >
                      {origin}
                    </li>
                  ))}
                </ul>
              </InsetField>
            )}
          </div>
        </section>

        {/* Metadata card */}
        <section className="rounded-3xl border border-turquoise-surf bg-white p-6 sm:p-8">
          <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
            Metadata
          </p>

          <div className="mt-5 grid gap-4">
            <InsetField label="Client ID">
              <code className="break-all font-[var(--font-geist-mono)] text-sm text-carbon-black">
                {client.client_id}
              </code>
            </InsetField>

            {client.created_at && (
              <InsetField label="Created At">
                <span className="text-sm text-carbon-black">
                  {new Date(client.created_at).toLocaleString()}
                </span>
              </InsetField>
            )}

            {client.updated_at && (
              <InsetField label="Updated At">
                <span className="text-sm text-carbon-black">
                  {new Date(client.updated_at).toLocaleString()}
                </span>
              </InsetField>
            )}

            {client.owner && (
              <InsetField label="Owner">
                <span className="text-sm text-carbon-black">{client.owner}</span>
              </InsetField>
            )}

            {client.client_uri && (
              <InsetField label="Client URI">
                <span className="break-all text-sm text-carbon-black">
                  {client.client_uri}
                </span>
              </InsetField>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InsetField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-ghost-white p-4">
      <p className="font-[var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.2em] text-cerulean/70">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
