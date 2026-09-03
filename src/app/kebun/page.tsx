import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/repo/garden";
import { KebunClient } from "./kebun-client";

export default async function KebunPage() {
  const user = await requireUser("customer");
  const dashboard = await getDashboard(user.id, user.name);
  return <KebunClient dashboard={dashboard} />;
}
