"use server";

import { revalidatePath } from "next/cache";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { CommunityTag } from "@/lib/repo/community";

export async function createPostAction(formData: FormData) {
  const user = await getSession();
  if (!user) return;

  const caption = String(formData.get("caption") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "");
  const plantIdRaw = String(formData.get("plantId") ?? "");
  const tag = (String(formData.get("tag") ?? "umum") as CommunityTag) ?? "umum";
  if (!caption) return;

  let plantId: number | null = null;
  if (plantIdRaw) {
    const [own] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM plants WHERE id = ? AND user_id = ?",
      [Number(plantIdRaw), user.id],
    );
    if (own[0]) plantId = own[0].id;
  }

  await pool.query(
    "INSERT INTO community_posts (user_id, plant_id, photo_url, caption, tag) VALUES (?,?,?,?,?)",
    [user.id, plantId, photoUrl, caption, tag],
  );
  revalidatePath("/kebun/komunitas");
}

export async function toggleLikeAction(postId: number) {
  const user = await getSession();
  if (!user) return;

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT 1 AS x FROM community_likes WHERE post_id = ? AND user_id = ?",
    [postId, user.id],
  );
  if (existing[0]) {
    await pool.query("DELETE FROM community_likes WHERE post_id = ? AND user_id = ?", [postId, user.id]);
  } else {
    await pool.query("INSERT IGNORE INTO community_likes (post_id, user_id) VALUES (?,?)", [postId, user.id]);
  }
  revalidatePath("/kebun/komunitas");
}
