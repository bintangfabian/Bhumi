import { requireUser } from "@/lib/session";
import { listCatalogPacks, getPackDetail } from "@/lib/repo/packs";
import { MulaiClient } from "./mulai-client";

export default async function MulaiPage() {
  const user = await requireUser("customer");
  const cards = await listCatalogPacks();
  const details = (
    await Promise.all(cards.map((c) => getPackDetail(c.id)))
  ).filter((d): d is NonNullable<typeof d> => d !== null);

  return <MulaiClient userName={user.name} packs={details} />;
}
