import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { relativeId, todayStart, ymd, addDays } from "@/lib/format";

export type CommunityTag = "panen" | "bibit-tunas" | "umum";

export type CommunityPost = {
  id: number;
  userName: string;
  userId: number;
  plantName: string | null;
  photo: string;
  caption: string;
  tag: CommunityTag;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
};

export type CommunityStats = {
  harvests: number;
  successRatePct: number;
  activeMembers: number;
};

export async function getCommunityStats(): Promise<CommunityStats> {
  const since = ymd(addDays(todayStart(), -90));
  const [harvestRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM plants WHERE harvested_on IS NOT NULL AND harvested_on >= ?",
    [since],
  );
  const [totalRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM plants WHERE created_at >= ?",
    [since],
  );
  const [activeRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(DISTINCT user_id) n FROM care_logs WHERE log_date >= ?",
    [ymd(addDays(todayStart(), -7))],
  );

  const harvests = Number(harvestRows[0]?.n ?? 0);
  const total = Number(totalRows[0]?.n ?? 0);
  const successRatePct = total > 0 ? Math.round((harvests / total) * 100) : 0;

  return {
    harvests,
    successRatePct,
    activeMembers: Number(activeRows[0]?.n ?? 0),
  };
}

export async function listUserPlantOptions(userId: number): Promise<{ id: number; name: string }[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name FROM plants WHERE user_id = ? AND harvested_on IS NULL ORDER BY id",
    [userId],
  );
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function listCommunityPosts(userId: number | null, limit = 20): Promise<CommunityPost[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT cp.id, cp.photo_url, cp.caption, cp.tag, cp.created_at,
            u.id AS user_id, u.name AS user_name, pl.name AS plant_name,
            (SELECT COUNT(*) FROM community_likes cl WHERE cl.post_id = cp.id) AS like_count,
            EXISTS(SELECT 1 FROM community_likes cl2 WHERE cl2.post_id = cp.id AND cl2.user_id = ?) AS liked_by_me
     FROM community_posts cp
     JOIN users u ON u.id = cp.user_id
     LEFT JOIN plants pl ON pl.id = cp.plant_id
     ORDER BY cp.created_at DESC
     LIMIT ?`,
    [userId ?? 0, limit],
  );
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    plantName: r.plant_name,
    photo: r.photo_url,
    caption: r.caption,
    tag: r.tag,
    createdAt: relativeId(new Date(r.created_at.replace(" ", "T"))),
    likeCount: Number(r.like_count),
    likedByMe: !!r.liked_by_me,
  }));
}
