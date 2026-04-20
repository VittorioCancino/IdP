import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopbar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-ghost-white text-carbon-black">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminSidebar />

        <section className="px-6 py-8 sm:px-8 lg:px-10">
          <AdminTopbar
            title="Hydra Clients"
            eyebrow="OAuth Client Registry"
            description="Review registered applications, inspect credential settings, and prepare CRUD operations from one internal panel."
            userName={session.user.name ?? "Admin"}
            userEmail={session.user.email ?? ""}
          />
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
