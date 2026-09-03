"use server";

import { revalidatePath } from "next/cache";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { AdminPack } from "@/lib/repo/admin";

export async function addPackAction(): Promise<string> {
  await requireUser("superadmin");
  const id = `paket-${Date.now()}`;
  await pool.query(
    `INSERT INTO packs (id, name, tagline, level, days, price, status, sold, photo_url, effort, sun, sort_order)
     VALUES (?, 'Paket baru', '', 'Pemula', 60, 0, 'Draf', 0, '', '10 mnt/hari', '5–6 jam', 999)`,
    [id],
  );
  revalidatePath("/admin");
  return id;
}

export async function savePackAction(pack: AdminPack) {
  await requireUser("superadmin");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE packs SET name=?, price=?, level=?, days=?, status=? WHERE id=?",
      [pack.name, Number(pack.price) || 0, pack.level, Number(pack.days) || 0, pack.status, pack.id],
    );

    const [existingStages] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM pack_stages WHERE pack_id = ?",
      [pack.id],
    );
    const existingIds = new Set<number>(existingStages.map((s) => s.id));
    const keepIds = new Set<number>();

    // Push existing stage_no out of the way first so the (pack_id, stage_no)
    // unique key doesn't collide while stages are being reordered below.
    await conn.query("UPDATE pack_stages SET stage_no = stage_no + 1000 WHERE pack_id = ?", [
      pack.id,
    ]);

    for (const [i, st] of pack.stages.entries()) {
      const isNew = typeof st.id === "string";
      let stageId: number;

      if (isNew) {
        const [res] = await conn.query<ResultSetHeader>(
          `INSERT INTO pack_stages (pack_id, stage_no, title, duration_days, media, instruction)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [pack.id, i + 1, st.title, Number(st.days) || 0, st.media, st.instruction],
        );
        stageId = res.insertId;
      } else {
        stageId = st.id as number;
        await conn.query(
          "UPDATE pack_stages SET stage_no=?, title=?, duration_days=?, media=?, instruction=? WHERE id=?",
          [i + 1, st.title, Number(st.days) || 0, st.media, st.instruction, stageId],
        );
        await conn.query("DELETE FROM stage_checklist WHERE stage_id = ?", [stageId]);
      }
      keepIds.add(stageId);

      for (const [ci, label] of st.checklist.entries()) {
        await conn.query(
          "INSERT INTO stage_checklist (stage_id, label, sort_order) VALUES (?,?,?)",
          [stageId, label, ci],
        );
      }
    }

    for (const id of existingIds) {
      if (!keepIds.has(id)) await conn.query("DELETE FROM pack_stages WHERE id = ?", [id]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  revalidatePath("/admin");
  revalidatePath("/katalog");
  revalidatePath(`/paket/${pack.id}`);
}
