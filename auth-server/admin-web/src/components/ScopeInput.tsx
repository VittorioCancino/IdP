'use client';

import { useState, useRef, type KeyboardEvent } from 'react';

const TRIGGER_KEYS = [' ', 'Enter', ','];

const HYDRA_DEFAULT_SCOPES = ['offline_access', 'offline', 'openid'];

export default function ScopeInput() {
  const [scopes, setScopes] = useState<string[]>(HYDRA_DEFAULT_SCOPES);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addScope(raw: string) {
    const value = raw.trim().replace(/,/g, '');
    if (!value || scopes.includes(value)) return;
    setScopes((prev) => [...prev, value]);
    setInputValue('');
  }

  function removeScope(scope: string) {
    setScopes((prev) => prev.filter((s) => s !== scope));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (TRIGGER_KEYS.includes(e.key)) {
      e.preventDefault();
      addScope(inputValue);
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && scopes.length > 0) {
      setScopes((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-carbon-black">Scopes</span>

      <div
        className="flex min-h-[50px] w-full cursor-text flex-wrap gap-2 rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3"
        onClick={() => inputRef.current?.focus()}
      >
        {scopes.map((scope) => {
          const isDefault = HYDRA_DEFAULT_SCOPES.includes(scope);
          return (
            <span
              key={scope}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-sm font-medium ${
                isDefault
                  ? 'bg-neutral/10 text-neutral/70'
                  : 'bg-turquoise-surf text-cerulean'
              }`}
            >
              {scope}
              <button
                type="button"
                onClick={() => removeScope(scope)}
                className={isDefault ? 'text-neutral/40 hover:text-neutral/70' : 'text-cerulean/60 hover:text-cerulean'}
                aria-label={`Remove ${scope}`}
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addScope(inputValue)}
          placeholder={scopes.length === 0 ? 'read write admin…' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-carbon-black outline-none placeholder:text-neutral/55"
        />
      </div>

      <p className="text-xs text-neutral/60">
        Press <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">Space</kbd>{' '}
        <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">Enter</kbd> or{' '}
        <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">,</kbd> to add a scope.
        {' '}Greyed-out scopes are Hydra defaults — remove them if not needed.
      </p>

      <input type="hidden" name="scope" value={scopes.join(' ')} />
    </div>
  );
}
