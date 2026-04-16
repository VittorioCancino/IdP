'use client';

import { useState } from 'react';

import { rotateHydraClientSecret } from '@/lib/api/hydra-clients';
import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';
import RotateSecretModal from '@/components/RotateSecretModal';

interface RotateSecretCardProps {
  clientId: string;
  clientName: string | undefined;
}

type State =
  | { status: 'idle' }
  | { status: 'confirming' }
  | { status: 'rotating' }
  | { status: 'done'; client: HydraClientCreateResponse }
  | { status: 'error'; message: string };

export default function RotateSecretCard({
  clientId,
  clientName,
}: RotateSecretCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleConfirm() {
    setState({ status: 'rotating' });

    const result = await rotateHydraClientSecret(clientId);

    if (result.err) {
      setState({ status: 'error', message: result.val.message });
      return;
    }

    setState({ status: 'done', client: result.val });
  }

  return (
    <>
      {(state.status === 'confirming' || state.status === 'rotating') && (
        <RotateSecretModal
          clientId={clientId}
          clientName={clientName}
          isRotating={state.status === 'rotating'}
          onConfirm={() => void handleConfirm()}
          onCancel={() => setState({ status: 'idle' })}
        />
      )}

      <section className="rounded-3xl border border-amber-100 bg-white">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center justify-between p-6 text-left sm:p-8"
        >
          <div>
            <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
              Credentials
            </p>
            <h4 className="mt-2 text-base font-semibold text-carbon-black">
              Rotate Secret
            </h4>
            <p className="mt-1.5 text-sm leading-6 text-neutral">
              Generate a new client secret. The current secret will be
              invalidated immediately — update all services using it before
              rotating.
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
          <div className="border-t border-amber-100 px-6 pb-8 pt-6 sm:px-8">
            {state.status === 'done' ? (
              <NewSecretDisplay client={state.client} />
            ) : (
              <div className="flex flex-col gap-4">
                {state.status === 'error' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.message}
                  </div>
                )}
                <p className="text-sm leading-6 text-neutral">
                  A new secret will be generated and the current one will stop
                  working immediately. Make sure to update all services before
                  proceeding.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setState({ status: 'confirming' })}
                    className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    Rotate Secret
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

function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
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
      <span className="text-xs font-medium uppercase tracking-widest text-amber-700">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <code className="flex-1 break-all text-sm text-amber-900">{value}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function NewSecretDisplay({ client }: { client: HydraClientCreateResponse }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <span className="mt-0.5 text-lg leading-none">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Save the new secret now
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            This is the only time the new secret will be shown. Hydra stores it
            hashed and cannot retrieve it again.
          </p>
        </div>
      </div>
      <CopyField label="Client ID" value={client.client_id} />
      {client.client_secret && (
        <CopyField label="New Client Secret" value={client.client_secret} />
      )}
    </div>
  );
}
