/**
 * Gamification types & display constants for Kebun Saya.
 * Actual per-user state is computed from MySQL in src/lib/repo/garden.ts.
 *
 * Rules from the design deck:
 * - No leaderboard, no generic points, no emoji as icons.
 * - Badges mark farming moments, not app moments.
 * - Failure is never punished; a broken streak restarts at 1 and the copy
 *   reassures instead of scolding.
 * - Health copy always contains an action, never a judgement.
 */

/* ---------- Milestone badges ---------- */

export type BadgeIconKey =
  | "benih"
  | "daun"
  | "polybag"
  | "bunga"
  | "buah"
  | "panen-1"
  | "panen-2"
  | "musim";

export type BadgeState = "locked" | "earned" | "new";

export type MilestoneBadge = {
  id: string;
  name: string;
  icon: BadgeIconKey;
  state: BadgeState;
  /** Date earned, present for `earned` and `new`. */
  earnedOn?: string;
};

/* ---------- Care streak ---------- */

/** One growth ring closes every RING_DAYS consecutive days. Three rings max. */
export const RING_DAYS = 6;
export const RING_COUNT = 3;

export type WeekDay = "done" | "shield" | "pending";

export type StreakVariant = "aktif" | "rekor" | "pelindung" | "mulai";

export type Streak = {
  days: number;
  best: number;
  variant: StreakVariant;
  /** Mon → Sun for the current week. */
  week: WeekDay[];
  shields: number;
  note: string;
};

export const STREAK_LABEL: Record<StreakVariant, string> = {
  aktif: "Aktif",
  rekor: "Rekor baru!",
  pelindung: "Pelindung terpakai",
  mulai: "Mulai lagi",
};

/* ---------- Plant health ---------- */

export type Health = "sehat" | "perhatian" | "kritis";

export const HEALTH_LABEL: Record<Health, string> = {
  sehat: "Sehat",
  perhatian: "Perlu perhatian",
  kritis: "Kritis",
};

/** Bars out of 5. Drops one per missed task day, recovers fully in 3 days. */
export const HEALTH_BARS: Record<Health, number> = {
  sehat: 5,
  perhatian: 3,
  kritis: 2,
};

export const HEALTH_COPY: Record<Health, string> = {
  sehat: "Perawatan sesuai panduan. Lanjutkan pola siram pagi seperti minggu ini.",
  perhatian:
    "Ada penyiraman yang terlewat. Siram hari ini sampai media lembap, cek lagi besok pagi.",
  kritis:
    "Tanaman butuh bantuan sekarang. Pangkas daun kering, siram perlahan, jauhkan dari matahari langsung.",
};

/* ---------- "Naik tahap" moment ---------- */

export type StageUnlock = {
  plantId: number;
  plantName: string;
  stageNo: number;
  range: string;
  title: string;
  body: string;
  recap: string[];
  teasers: { title: string; when: string; pct: number }[];
};
