import { headers } from "next/headers";

import type { HydraClientSummary } from "@/lib/types/hydra-client.types";
import ClientsDashboard from "@/components/ClientsDashboard";

async function getHydraClients(): Promise<HydraClientSummary[]> {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3001";
  const requestHeaders = await headers();
  const response = await fetch(`${baseUrl}/api/v1/hydra/clients`, {
    cache: "no-store",
    headers: {
      Cookie: requestHeaders.get("cookie") ?? "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Hydra clients.");
  }

  return response.json();
}

export default async function AdminClientsPage() {
  const clients = await getHydraClients();

  return <ClientsDashboard initialClients={clients} />;
}
