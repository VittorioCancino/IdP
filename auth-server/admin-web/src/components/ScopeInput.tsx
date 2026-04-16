'use client';

import { useState, useRef, type KeyboardEvent } from 'react';

const TRIGGER_KEYS = [' ', 'Enter', ','];

const HYDRA_DEFAULT_SCOPES = ['offline_access', 'offline', 'openid'];

interface TagInputProps {
  label?: string;
  name?: string;
  placeholder?: string;
  defaultTags?: string[];
  hint?: string;
}

export default function ScopeInput({
  label = 'Scopes',
  name = 'scope',
  placeholder = 'read write admin…',
  defaultTags = HYDRA_DEFAULT_SCOPES,
  hint,
}: TagInputProps = {}) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const value = raw.trim().replace(/,/g, '');
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setInputValue('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (TRIGGER_KEYS.includes(e.key)) {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  const resolvedHint =
    hint ??
    (name === 'scope'
      ? 'Greyed-out scopes are Hydra defaults — remove them if not needed.'
      : undefined);

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-carbon-black">{label}</span>

      <div
        className="flex min-h-[50px] w-full cursor-text flex-wrap gap-2 rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => {
          const isDefault = defaultTags.includes(tag);
          return (
            <span
              key={tag}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-sm font-medium ${
                isDefault
                  ? 'bg-neutral/10 text-neutral/70'
                  : 'bg-turquoise-surf text-cerulean'
              }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className={
                  isDefault
                    ? 'text-neutral/40 hover:text-neutral/70'
                    : 'text-cerulean/60 hover:text-cerulean'
                }
                aria-label={`Remove ${tag}`}
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
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent text-carbon-black outline-none placeholder:text-neutral/55"
        />
      </div>

      <p className="text-xs text-neutral/60">
        Press{' '}
        <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">
          Space
        </kbd>{' '}
        <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">
          Enter
        </kbd>{' '}
        or{' '}
        <kbd className="rounded bg-turquoise-surf px-1 py-0.5 font-mono text-cerulean">
          ,
        </kbd>{' '}
        to add a tag.
        {resolvedHint && <> {resolvedHint}</>}
      </p>

      <input type="hidden" name={name} value={tags.join(' ')} />
    </div>
  );
}
