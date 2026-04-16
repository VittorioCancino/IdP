type AdminTopbarProps = {
  title: string;
  eyebrow: string;
  description: string;
  userName: string;
  userEmail: string;
};

export function AdminTopbar({
  title,
  eyebrow,
  description,
  userName,
  userEmail,
}: AdminTopbarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-turquoise-surf pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.24em] text-cerulean/70">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-carbon-black">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-neutral">{description}</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-turquoise-surf bg-white px-4 py-3 shadow-[0_10px_24px_rgba(2,132,199,0.06)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-carbon-black text-sm font-semibold text-ghost-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-[var(--font-geist-mono)] text-[0.65rem] uppercase tracking-[0.22em] text-cerulean/70">
            Active Session
          </p>
          <p className="mt-1 truncate text-sm font-medium text-carbon-black">
            {userName}
          </p>
          <p className="truncate text-sm text-neutral">{userEmail}</p>
        </div>
      </div>
    </header>
  );
}
