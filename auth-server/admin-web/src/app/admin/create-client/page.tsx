'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { createHydraClient } from '@/lib/api/hydra-clients';
import { CreateHydraClientBodySchema } from '@/lib/types/hydra-client.types';
import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';
import type { ApiError } from '@/lib/types/api.types';
import ScopeInput from '@/components/ScopeInput';

type State =
  | { status: 'form'; isSubmitting: boolean; apiError?: ApiError }
  | { status: 'created'; client: HydraClientCreateResponse };

export default function AdminCreateClientPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'form', isSubmitting: false });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const parsed = CreateHydraClientBodySchema.safeParse({
      client_id: formData.get('client_id'),
      client_name: formData.get('client_name'),
      scope: formData.get('scope'),
      audience: formData.get('audience'),
      token_endpoint_auth_method: formData.get('token_endpoint_auth_method'),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setState({
        status: 'form',
        isSubmitting: false,
        apiError: { message: 'Please fix the errors below.', errors: fieldErrors },
      });
      return;
    }

    setState({ status: 'form', isSubmitting: true });

    const result = await createHydraClient(parsed.data);

    if (result.err) {
      setState({ status: 'form', isSubmitting: false, apiError: result.val });
      return;
    }

    setState({ status: 'created', client: result.val });
  }

  if (state.status === 'created') {
    return (
      <CreatedView
        client={state.client}
        onDone={() => router.push('/admin/clients')}
      />
    );
  }

  return (
    <section className="max-w-3xl rounded-3xl border border-turquoise-surf bg-white p-6 sm:p-8">
      <div>
        <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.22em] text-cerulean/70">
          Machine To Machine Client
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-carbon-black">
          Create OAuth 2.0 Client
        </h3>
        <p className="mt-3 text-sm leading-7 text-neutral">
          This form creates a machine-to-machine Hydra client using the{' '}
          <code>client_credentials</code> grant.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-carbon-black" htmlFor="client_id">
            Client ID
          </label>
          <input
            id="client_id"
            type="text"
            name="client_id"
            placeholder="payments-service"
            className={`w-full rounded-2xl border bg-ghost-white px-4 py-3.5 text-carbon-black outline-none placeholder:text-neutral/55 ${
              state.apiError?.errors?.client_id ? 'border-red-300' : 'border-turquoise-surf'
            }`}
          />
          <FieldError messages={state.apiError?.errors?.client_id} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-carbon-black" htmlFor="client_name">
            Client Name
          </label>
          <input
            id="client_name"
            type="text"
            name="client_name"
            placeholder="Payments Service"
            className={`w-full rounded-2xl border bg-ghost-white px-4 py-3.5 text-carbon-black outline-none placeholder:text-neutral/55 ${
              state.apiError?.errors?.client_name ? 'border-red-300' : 'border-turquoise-surf'
            }`}
          />
          <FieldError messages={state.apiError?.errors?.client_name} />
        </div>

        <ScopeInput />

        <ScopeInput
          label="Audience"
          name="audience"
          placeholder="https://api.example.com/payments…"
          defaultTags={[]}
          hint="Resource server URLs this client is allowed to request tokens for."
        />

        <label className="grid gap-2">
          <span className="text-sm font-medium text-carbon-black">
            Token Endpoint Auth Method
          </span>
          <select
            name="token_endpoint_auth_method"
            defaultValue="client_secret_basic"
            className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3.5 text-carbon-black outline-none"
          >
            <option value="client_secret_basic">client_secret_basic</option>
            <option value="client_secret_post">client_secret_post</option>
          </select>
        </label>

        <div className="rounded-2xl bg-ghost-white p-4 text-sm leading-7 text-neutral">
          Grant type is fixed to <strong>client_credentials</strong> for this
          first version.
        </div>

        {state.apiError && !hasOnlyFieldErrors(state.apiError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.apiError.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={state.isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-carbon-black px-5 py-3 text-sm font-semibold text-ghost-white disabled:opacity-60"
          >
            {state.isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ghost-white/30 border-t-ghost-white" />
            )}
            {state.isSubmitting ? 'Creating…' : 'Create Client'}
          </button>
        </div>
      </form>
    </section>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <ul className="grid gap-0.5">
      {messages.map((m) => (
        <li key={m} className="text-xs text-red-500">{m}</li>
      ))}
    </ul>
  );
}

function hasOnlyFieldErrors(apiError: ApiError): boolean {
  const fieldKeys = ['client_id', 'client_name', 'scope', 'token_endpoint_auth_method'];
  const errorKeys = Object.keys(apiError.errors ?? {});
  return errorKeys.length > 0 && errorKeys.every((k) => fieldKeys.includes(k));
}


function CopyField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="grid gap-1.5">
      <span
        className={`text-xs font-medium uppercase tracking-widest ${highlight ? 'text-amber-700' : 'text-cerulean/70'}`}
      >
        {label}
      </span>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          highlight
            ? 'border-amber-200 bg-amber-50'
            : 'border-turquoise-surf bg-ghost-white'
        }`}
      >
        <code
          className={`flex-1 break-all text-sm ${highlight ? 'text-amber-900' : 'text-carbon-black'}`}
        >
          {value}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 text-xs font-medium ${
            highlight
              ? 'text-amber-700 hover:text-amber-900'
              : 'text-cerulean hover:text-ocean-blue'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function CreatedView({
  client,
  onDone,
}: {
  client: HydraClientCreateResponse;
  onDone: () => void;
}) {
  return (
    <section className="max-w-3xl rounded-3xl border border-turquoise-surf bg-white p-6 sm:p-8">

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-turquoise-surf text-cerulean">
          ✓
        </div>
        <div>
          <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.22em] text-cerulean/70">
            Client Created
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-carbon-black">
            {client.client_name ?? client.client_id}
          </h3>
          {client.client_name && (
            <p className="mt-0.5 font-[var(--font-geist-mono)] text-xs text-neutral/60">
              {client.client_id}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 h-px bg-turquoise-surf" />

      {/* Client details grid */}
      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
        {client.scope && (
          <div className="col-span-2 grid gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-cerulean/70">
              Scopes
            </span>
            <div className="flex flex-wrap gap-2">
              {client.scope.split(' ').filter(Boolean).map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-turquoise-surf px-2.5 py-0.5 text-sm font-medium text-cerulean"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-cerulean/70">
            Grant Types
          </span>
          <div className="flex flex-wrap gap-2">
            {client.grant_types.map((g) => (
              <span
                key={g}
                className="rounded-lg border border-turquoise-surf px-2.5 py-0.5 text-sm text-carbon-black"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {client.token_endpoint_auth_method && (
          <div className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-cerulean/70">
              Auth Method
            </span>
            <p className="text-sm text-carbon-black">
              {client.token_endpoint_auth_method}
            </p>
          </div>
        )}

        {client.created_at && (
          <div className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-cerulean/70">
              Created At
            </span>
            <p className="text-sm text-carbon-black">
              {new Date(client.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 h-px bg-turquoise-surf" />

      {/* One-time credentials card */}
      <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="mt-0.5 text-lg leading-none">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Save these credentials now
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              The client secret is shown only once. Hydra stores it hashed and
              cannot retrieve it again. Copy both values before leaving this page.
            </p>
          </div>
        </div>
        <div className="grid gap-3">
          <CopyField label="Client ID" value={client.client_id} highlight />
          {client.client_secret && (
            <CopyField label="Client Secret" value={client.client_secret} highlight />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onDone}
          className="rounded-2xl bg-carbon-black px-5 py-3 text-sm font-semibold text-ghost-white"
        >
          Go to Clients
        </button>
      </div>
    </section>
  );
}
