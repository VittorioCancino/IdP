"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/admin/clients",
    label: "Clients",
  },
  {
    href: "/admin/create-client",
    label: "Create Client",
  },
  {
    href: "/admin/tokens",
    label: "Introspect Token",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-r border-turquoise-surf bg-white/70 px-6 py-8">
      <div>
        <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.28em] text-cerulean/70">
          Hydra Admin
        </p>
        <h1 className="mt-4 text-2xl font-semibold">Control Panel</h1>
        <p className="mt-2 text-sm leading-7 text-neutral">
          Internal wrapper for the Hydra Admin API.
        </p>
      </div>

      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "block rounded-2xl bg-carbon-black px-4 py-3 text-sm font-medium text-ghost-white"
                  : "block rounded-2xl px-4 py-3 text-sm text-neutral"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
