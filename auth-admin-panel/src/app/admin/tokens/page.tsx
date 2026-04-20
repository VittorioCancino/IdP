'use client';

import { useState } from 'react';

import { introspectToken } from '@/lib/api/hydra-clients';
import type { TokenIntrospectionResponse } from '@/lib/types/hydra-token.types';
import type { ApiError } from '@/lib/types/api.types';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'result'; data: TokenIntrospectionResponse }
  | { status: 'error'; error: ApiError };

export default function TokensPage() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token.trim()) return;

    setState({ status: 'loading' });

    const result = await introspectToken(token.trim());

    if (result.err) {
      setState({ status: 'error', error: result.val });
      return;
    }

    setState({ status: 'result', data: result.val });
  }

  function handleReset() {
    setToken('');
    setState({ status: 'idle' });
  }

  return (
    <div className="max-w-3xl">
      <div>
        <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.22em] text-cerulean/70">
          Token Management
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-carbon-black">
          Introspect Token
        </h3>
        <p className="mt-3 text-sm leading-7 text-neutral">
          Paste an access token to check whether it is active and inspect its
          claims as reported by Hydra.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-carbon-black" htmlFor="token">
            Access Token
          </label>
          <textarea
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={state.status === 'loading'}
            placeholder="ory_at_..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3.5 font-[var(--font-geist-mono)] text-sm text-carbon-black outline-none placeholder:text-neutral/40 disabled:opacity-50"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={!token.trim() || state.status === 'loading'}
            className="flex items-center gap-2 rounded-2xl bg-carbon-black px-5 py-3 text-sm font-semibold text-ghost-white disabled:opacity-50"
          >
            {state.status === 'loading' && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ghost-white/30 border-t-ghost-white" />
            )}
            {state.status === 'loading' ? 'Checking…' : 'Introspect'}
          </button>
          {state.status !== 'idle' && state.status !== 'loading' && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-turquoise-surf px-5 py-3 text-sm text-carbon-black"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {state.status === 'error' && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error.message}
        </div>
      )}

      {state.status === 'result' && (
        <div className="mt-6">
          <div className={`flex items-center gap-3 rounded-2xl border p-5 ${
            state.data.active
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-neutral/20 bg-ghost-white'
          }`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
              state.data.active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-neutral/10 text-neutral/60'
            }`}>
              {state.data.active ? '✓' : '✕'}
            </span>
            <div>
              <p className={`text-sm font-semibold ${
                state.data.active ? 'text-emerald-800' : 'text-neutral/60'
              }`}>
                {state.data.active ? 'Token is active' : 'Token is inactive or expired'}
              </p>
              {state.data.active && state.data.exp && (
                <p className="mt-0.5 text-xs text-emerald-700">
                  Expires {new Date(state.data.exp * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {state.data.active && (
            <div className="mt-4 rounded-2xl border border-turquoise-surf bg-white">
              <div className="border-b border-turquoise-surf px-5 py-4">
                <h4 className="text-sm font-semibold text-carbon-black">Token Claims</h4>
              </div>
              <dl className="divide-y divide-turquoise-surf">
                {state.data.client_id && (
                  <ClaimRow label="Client ID" value={state.data.client_id} mono />
                )}
                {state.data.sub && state.data.sub !== state.data.client_id && (
                  <ClaimRow label="Subject" value={state.data.sub} mono />
                )}
                {state.data.scope && (
                  <ClaimRow
                    label="Scopes"
                    value={
                      <div className="flex flex-wrap gap-1.5">
                        {state.data.scope.split(' ').filter(Boolean).map((s) => (
                          <span
                            key={s}
                            className="rounded-lg bg-turquoise-surf px-2 py-0.5 text-xs font-medium text-cerulean"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
                {state.data.token_type && (
                  <ClaimRow label="Token Type" value={state.data.token_type} />
                )}
                {state.data.token_use && (
                  <ClaimRow label="Token Use" value={state.data.token_use} />
                )}
                {state.data.iss && (
                  <ClaimRow label="Issuer" value={state.data.iss} mono />
                )}
                {state.data.iat && (
                  <ClaimRow
                    label="Issued At"
                    value={new Date(state.data.iat * 1000).toLocaleString()}
                  />
                )}
                {state.data.nbf && (
                  <ClaimRow
                    label="Not Before"
                    value={new Date(state.data.nbf * 1000).toLocaleString()}
                  />
                )}
                {state.data.exp && (
                  <ClaimRow
                    label="Expires At"
                    value={new Date(state.data.exp * 1000).toLocaleString()}
                  />
                )}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClaimRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-4 px-5 py-3.5">
      <dt className="text-xs font-medium uppercase tracking-widest text-cerulean/70 pt-0.5">
        {label}
      </dt>
      <dd className={`text-sm text-carbon-black ${mono ? 'font-[var(--font-geist-mono)]' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
