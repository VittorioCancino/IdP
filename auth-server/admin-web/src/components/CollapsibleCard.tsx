'use client';

import { useState } from 'react';

type Variant = 'neutral' | 'warning' | 'danger';

interface CollapsibleCardProps {
  eyebrow: string;
  title: string;
  description: string;
  variant?: Variant;
  children: React.ReactNode;
}

const borderClass: Record<Variant, string> = {
  neutral: 'border-turquoise-surf',
  warning: 'border-amber-100',
  danger: 'border-red-100',
};

export default function CollapsibleCard({
  eyebrow,
  title,
  description,
  variant = 'neutral',
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`rounded-3xl border bg-white ${borderClass[variant]}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between p-6 text-left sm:p-8"
      >
        <div>
          <p className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/70">
            {eyebrow}
          </p>
          <h4 className="mt-2 text-base font-semibold text-carbon-black">{title}</h4>
          <p className="mt-1.5 text-sm leading-6 text-neutral">{description}</p>
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
        <div className={`border-t px-6 pb-8 pt-6 sm:px-8 ${borderClass[variant]}`}>
          {children}
        </div>
      )}
    </section>
  );
}
