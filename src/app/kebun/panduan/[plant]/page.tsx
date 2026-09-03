import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getGuide } from "@/lib/repo/garden";
import { PanduanClient } from "./panduan-client";

export default async function PanduanPage({
  params,
}: {
  params: Promise<{ plant: string }>;
}) {
  const { plant } = await params;
  const plantId = Number(plant);
  if (!Number.isInteger(plantId)) notFound();

  const user = await requireUser("customer");
  const guide = await getGuide(user.id, plantId);
  if (!guide) notFound();

  return <PanduanClient guide={guide} />;
}
