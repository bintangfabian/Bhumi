import { requireUser } from "@/lib/session";
import { getCommunityStats, listCommunityPosts, listUserPlantOptions } from "@/lib/repo/community";
import { KomunitasClient } from "./komunitas-client";

export default async function KomunitasPage() {
  const user = await requireUser("customer");
  const [stats, posts, plants] = await Promise.all([
    getCommunityStats(),
    listCommunityPosts(user.id),
    listUserPlantOptions(user.id),
  ]);
  return <KomunitasClient stats={stats} posts={posts} plants={plants} />;
}
