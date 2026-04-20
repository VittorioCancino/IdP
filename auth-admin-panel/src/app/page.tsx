import { signIn } from "@/auth";
import { LoginBodySchema } from "@/lib/types/auth.types";

export default function Home() {
  async function authenticate(formData: FormData) {
    "use server";

    const parsedCredentials = LoginBodySchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsedCredentials.success) {
      return;
    }

    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: "/admin/clients",
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ghost-white px-6 py-10 text-carbon-black sm:px-8">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
        <section className="flex flex-col justify-center">
          <div className="max-w-2xl">
            <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.28em] text-cerulean/70">
              Hydra Admin Console
            </p>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl leading-tight tracking-[-0.04em] text-carbon-black sm:text-6xl">
              Sign in to continue.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral">
              Restricted access for internal operators managing clients,
              credentials, and identity platform settings.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-neutral">
            <span className="rounded-full border border-turquoise-surf bg-white px-4 py-2">
              Internal access only
            </span>
            <span className="rounded-full border border-turquoise-surf bg-white px-4 py-2">
              Server-side admin routes
            </span>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-turquoise-surf bg-white p-6 shadow-[0_20px_60px_rgba(2,132,199,0.08)] sm:p-8">
            <div>
              <p className="font-[var(--font-geist-mono)] text-[0.72rem] uppercase tracking-[0.24em] text-cerulean/70">
                Administrator Login
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-carbon-black">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral">
                Use your administrator credentials to access the console.
              </p>
            </div>

            <form action={authenticate} className="mt-8 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-carbon-black">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3.5 text-carbon-black outline-none transition placeholder:text-neutral/55 focus:border-ocean-blue focus:ring-4 focus:ring-turquoise-surf"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-carbon-black">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-turquoise-surf bg-ghost-white px-4 py-3.5 text-carbon-black outline-none transition placeholder:text-neutral/55 focus:border-ocean-blue focus:ring-4 focus:ring-turquoise-surf"
                />
              </label>

              <div className="flex justify-end text-sm text-neutral">
                <span className="font-[var(--font-geist-mono)] text-[0.68rem] uppercase tracking-[0.22em] text-cerulean/55">
                  Secure session
                </span>
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-carbon-black px-5 py-3.5 text-sm font-semibold text-ghost-white transition hover:bg-cerulean"
              >
                Sign In
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
