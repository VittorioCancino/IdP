'use client';

import { useState } from 'react';

import { revokeHydraClientTokens } from '@/lib/api/hydra-clients';

interface RevokeTokensCardProps {
  clientId: string;
  clientName: string | undefined;
}

type State =
  | { status: 'idle' }
  | { status: 'confirming' }
  | { status: 'revoking' }
  | { status: 'done' }
  | { status: 'error'; message: string };

export default function RevokeTokensCard({
  clientId,
  clientName,
}: RevokeTokensCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleConfirm() {
    setState({ status: 'revoking' });

    const result = await revokeHydraClientTokens(clientId);

    if (result.err) {
      setState({ status: 'error', message: result.val.message });
      return;
    }

    setState({ status: 'done' });
  }

  return (
    <>
      {(state.status === 'confirming' || state.status === 'revoking') && (
        <RevokeTokensModal
          clientId={clientId}
          clientName={clientName}
          isRevoking={state.status === 'revoking'}
          onConfirm={() => void handleConfirm()}
          onCancel={() => setState({ status: 'idle' })}
        />
      )}

      <section className="rounded-3xl border border-red-100 bg-white">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center justify-between p-6 text-left sm:p-8"
        >
          <div>
            <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
              Token Management
            </p>
            <h4 className="mt-2 text-base font-semibold text-carbon-black">
              Revoke All Tokens
            </h4>
            <p className="mt-1.5 text-sm leading-6 text-neutral">
              Revoke all active access tokens issued to this client. Any service
              currently authenticated will lose access immediately.
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`ml-6 h-5 w-5 shrink-0 text-neutral transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="border-t border-red-100 px-6 pb-8 pt-6 sm:px-8">
            {state.status === 'done' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                All tokens for this client have been revoked. Services will need
                to re-authenticate before making further requests.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {state.status === 'error' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.message}
                  </div>
                )}
                <p className="text-sm leading-6 text-neutral">
                  All active tokens will be invalidated immediately. Services
                  using this client will need to re-authenticate.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setState({ status: 'confirming' })}
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    Revoke All Tokens
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function RevokeTokensModal({
  clientId,
  clientName,
  isRevoking,
  onConfirm,
  onCancel,
}: {
  clientId: string;
  clientName: string | undefined;
  isRevoking: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const confirmTarget = clientName ?? clientId;
  const isConfirmed = inputValue === confirmTarget;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-carbon-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500">
            ⚠
          </div>
          <div>
            <h3 className="text-lg font-semibold text-carbon-black">
              Revoke all tokens
            </h3>
            <p className="mt-1 text-sm leading-6 text-neutral">
              All active access tokens for{' '}
              <code className="rounded bg-ghost-white px-1.5 py-0.5 text-xs text-carbon-black">
                {clientId}
              </code>{' '}
              will be invalidated immediately. Services will need to
              re-authenticate before making further requests.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <label className="text-sm text-neutral">
            Type{' '}
            <code className="rounded bg-ghost-white px-1.5 py-0.5 text-xs font-semibold text-carbon-black">
              {confirmTarget}
            </code>{' '}
            to confirm
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isRevoking}
            placeholder={confirmTarget}
            className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3 text-sm text-carbon-black outline-none placeholder:text-neutral/40 disabled:opacity-50"
            autoFocus
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRevoking}
            className="rounded-2xl border border-turquoise-surf px-4 py-2.5 text-sm text-carbon-black disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isRevoking}
            className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-40"
          >
            {isRevoking && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
            )}
            {isRevoking ? 'Revoking…' : 'Revoke all tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
