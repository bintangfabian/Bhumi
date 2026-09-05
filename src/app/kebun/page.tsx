import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDashboard } from "@/lib/repo/garden";
import { listCatalogPacks } from "@/lib/repo/packs";
import { KebunClient } from "./kebun-client";
import { WelcomeSplash } from "./welcome-splash";

export default async function KebunPage() {
  const user = await getSession();

  if (!user) {
    const packs = await listCatalogPacks();
    return <WelcomeSplash pack={packs[0] ?? null} />;
  }
  if (user.role !== "customer") redirect("/admin");

  const dashboard = await getDashboard(user.id, user.name);
  return <KebunClient dashboard={dashboard} />;
}
