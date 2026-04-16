'use client';

import { useState, useEffect, useRef } from 'react';

interface RotateSecretModalProps {
  clientId: string;
  clientName: string | undefined;
  isRotating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RotateSecretModal({
  clientId,
  clientName,
  isRotating,
  onConfirm,
  onCancel,
}: RotateSecretModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmTarget = clientName ?? clientId;
  const isConfirmed = inputValue === confirmTarget;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600">
            ⚠
          </div>
          <div>
            <h3 className="text-lg font-semibold text-carbon-black">
              Rotate client secret
            </h3>
            <p className="mt-1 text-sm leading-6 text-neutral">
              The current secret for{' '}
              <code className="rounded bg-ghost-white px-1.5 py-0.5 text-xs text-carbon-black">
                {clientId}
              </code>{' '}
              will be invalidated immediately. Any service using it will fail to
              authenticate until updated with the new secret.
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
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isRotating}
            placeholder={confirmTarget}
            className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3 text-sm text-carbon-black outline-none placeholder:text-neutral/40 disabled:opacity-50"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRotating}
            className="rounded-2xl border border-turquoise-surf px-4 py-2.5 text-sm text-carbon-black disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isRotating}
            className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 disabled:opacity-40"
          >
            {isRotating && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
            )}
            {isRotating ? 'Rotating…' : 'Rotate secret'}
          </button>
        </div>
      </div>
    </div>
  );
}
