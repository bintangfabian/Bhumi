import { requireUser } from "@/lib/session";
import { getDashboard, getBadgesAndStreak } from "@/lib/repo/garden";
import { getProfile, listHarvestedPlants } from "@/lib/repo/profile";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const user = await requireUser("customer");
  const [profile, dashboard, { badges, streak }, harvested] = await Promise.all([
    getProfile(user.id),
    getDashboard(user.id, user.name),
    getBadgesAndStreak(user.id),
    listHarvestedPlants(user.id),
  ]);
  if (!profile) return null;

  return (
    <ProfilClient
      profile={profile}
      activePlants={dashboard.plants}
      harvestedPlants={harvested}
      badgeCount={badges.filter((b) => b.state !== "locked").length}
      streakDays={streak.days}
    />
  );
}
