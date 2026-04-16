'use client';

import { useState } from 'react';

import { updateHydraClient } from '@/lib/api/hydra-clients';
import { UpdateHydraClientBodySchema } from '@/lib/types/hydra-client.types';
import type { HydraClientCreateResponse } from '@/lib/types/hydra-client.types';
import type { ApiError } from '@/lib/types/api.types';
import ScopeInput from '@/components/ScopeInput';

interface EditClientFormProps {
  client: HydraClientCreateResponse;
}

export default function EditClientForm({ client }: EditClientFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiError | undefined>();
  const [savedAt, setSavedAt] = useState<Date | undefined>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError(undefined);
    setSavedAt(undefined);

    const formData = new FormData(e.currentTarget);
    const parsed = UpdateHydraClientBodySchema.safeParse({
      client_name: formData.get('client_name'),
      scope: formData.get('scope'),
      audience: formData.get('audience'),
      token_endpoint_auth_method: formData.get('token_endpoint_auth_method'),
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setApiError({ message: 'Please fix the errors below.', errors: fieldErrors });
      return;
    }

    setIsSubmitting(true);
    const result = await updateHydraClient(client.client_id, parsed.data);
    setIsSubmitting(false);

    if (result.err) {
      setApiError(result.val);
      return;
    }

    setSavedAt(new Date());
  }

  return (
    <section className="rounded-3xl border border-turquoise-surf bg-white">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between p-6 text-left sm:p-8"
      >
        <div>
          <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
            Client Settings
          </p>
          <h4 className="mt-2 text-base font-semibold text-carbon-black">
            Edit Client
          </h4>
          <p className="mt-1.5 text-sm leading-6 text-neutral">
            Update this client&apos;s name, scopes, audience, and auth settings.
            Locked fields are immutable in Hydra.
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
        <div className="border-t border-turquoise-surf px-6 pb-8 pt-6 sm:px-8">
    <form onSubmit={handleSubmit} className="grid gap-5">

      {/* Immutable fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <LockedField label="Client ID" value={client.client_id} />
        <LockedField
          label="Grant Types"
          value={client.grant_types.join(', ') || 'None'}
        />
      </div>

      <div className="h-px bg-turquoise-surf" />

      {/* Editable fields */}
      <div className="grid gap-2">
        <label className="text-sm font-medium text-carbon-black" htmlFor="client_name">
          Client Name
        </label>
        <input
          id="client_name"
          type="text"
          name="client_name"
          defaultValue={client.client_name ?? ''}
          className={`w-full rounded-2xl border bg-ghost-white px-4 py-3.5 text-carbon-black outline-none placeholder:text-neutral/55 ${
            apiError?.errors?.client_name ? 'border-red-300' : 'border-turquoise-surf'
          }`}
        />
        <FieldError messages={apiError?.errors?.client_name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-carbon-black" htmlFor="token_endpoint_auth_method">
            Auth Method
          </label>
          <select
            id="token_endpoint_auth_method"
            name="token_endpoint_auth_method"
            defaultValue={client.token_endpoint_auth_method ?? 'client_secret_basic'}
            className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3.5 text-carbon-black outline-none"
          >
            <option value="client_secret_basic">client_secret_basic</option>
            <option value="client_secret_post">client_secret_post</option>
            <option value="private_key_jwt">private_key_jwt</option>
            <option value="none">none</option>
          </select>
        </div>

      </div>

      <ScopeInput
        defaultTags={client.scope?.split(' ').filter(Boolean) ?? []}
      />

      <ScopeInput
        label="Audience"
        name="audience"
        placeholder="https://api.example.com/payments…"
        defaultTags={client.audience ?? []}
        hint="Resource server URLs this client is allowed to request tokens for."
      />

      {/* General error banner */}
      {apiError && !hasOnlyFieldErrors(apiError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError.message}
        </div>
      )}

      {/* Success confirmation */}
      {savedAt && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Changes saved at {savedAt.toLocaleTimeString()}.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-2xl bg-carbon-black px-5 py-3 text-sm font-semibold text-ghost-white disabled:opacity-60"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ghost-white/30 border-t-ghost-white" />
          )}
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
        </div>
      )}
    </section>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-neutral/60">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            fillRule="evenodd"
            d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v4A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
            clipRule="evenodd"
          />
        </svg>
        {label}
      </span>
      <div className="w-full rounded-2xl border border-turquoise-surf/50 bg-neutral/5 px-4 py-3.5">
        <span className="font-[var(--font-geist-mono)] text-sm text-neutral/60">
          {value}
        </span>
      </div>
    </div>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <ul className="grid gap-0.5">
      {messages.map((m) => (
        <li key={m} className="text-xs text-red-500">
          {m}
        </li>
      ))}
    </ul>
  );
}

function hasOnlyFieldErrors(apiError: ApiError): boolean {
  const fieldKeys = [
    'client_name',
    'scope',
    'audience',
    'token_endpoint_auth_method',
  ];
  const errorKeys = Object.keys(apiError.errors ?? {});
  return errorKeys.length > 0 && errorKeys.every((k) => fieldKeys.includes(k));
}
