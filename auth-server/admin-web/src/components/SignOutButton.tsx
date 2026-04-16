"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="rounded-xl border border-turquoise-surf px-3 py-1.5 font-[var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.18em] text-neutral transition-colors hover:border-carbon-black hover:text-carbon-black"
    >
      Sign out
    </button>
  );
}
