import { requireUser } from "@/lib/session";
import { listCareIssues } from "@/lib/repo/learn";
import { listCatalogPacks } from "@/lib/repo/packs";
import { BelajarClient } from "./belajar-client";

export default async function BelajarPage() {
  await requireUser("customer");
  const [issues, packs] = await Promise.all([listCareIssues(), listCatalogPacks()]);
  return <BelajarClient issues={issues} packs={packs} />;
}
