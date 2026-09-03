import { listCatalogPacks } from "@/lib/repo/packs";
import { KatalogClient } from "./katalog-client";

export default async function KatalogPage() {
  const packs = await listCatalogPacks();
  return <KatalogClient packs={packs} />;
}
