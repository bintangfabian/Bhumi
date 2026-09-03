import { requireUser } from "@/lib/session";
import { listAdminPacks } from "@/lib/repo/admin";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  await requireUser("superadmin");
  const packs = await listAdminPacks();
  return <AdminClient initialPacks={packs} />;
}
