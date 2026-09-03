"use server";

import { revalidatePath } from "next/cache";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ymd, todayStart } from "@/lib/format";

export async function toggleTaskAction(taskId: number) {
  const user = await getSession();
  if (!user) return;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pt.id, pt.done_at FROM plant_tasks pt
     JOIN plants p ON p.id = pt.plant_id WHERE pt.id = ? AND p.user_id = ?`,
    [taskId, user.id],
  );
  const task = rows[0];
  if (!task) return;

  if (task.done_at) {
    await pool.query("UPDATE plant_tasks SET done_at = NULL WHERE id = ?", [taskId]);
  } else {
    await pool.query("UPDATE plant_tasks SET done_at = NOW() WHERE id = ?", [taskId]);
  }

  const today = todayStart();
  const [agg] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) n, SUM(pt.done_at IS NOT NULL) d FROM plant_tasks pt
     JOIN plants p ON p.id = pt.plant_id WHERE p.user_id = ? AND pt.task_date = ?`,
    [user.id, ymd(today)],
  );
  const total = Number(agg[0]?.n ?? 0);
  const done = Number(agg[0]?.d ?? 0);

  if (total > 0 && total === done) {
    await pool.query(
      `INSERT INTO care_logs (user_id, log_date, kind) VALUES (?, ?, 'done')
       ON DUPLICATE KEY UPDATE kind = 'done'`,
      [user.id, ymd(today)],
    );
  } else {
    await pool.query("DELETE FROM care_logs WHERE user_id = ? AND log_date = ?", [
      user.id,
      ymd(today),
    ]);
  }

  // Recompute the consecutive-day streak and bump the recorded best if this is a new high.
  const [logs] = await pool.query<RowDataPacket[]>(
    "SELECT log_date FROM care_logs WHERE user_id = ?",
    [user.id],
  );
  const dates = new Set(logs.map((l) => l.log_date as string));
  let days = 0;
  let c = today;
  while (dates.has(ymd(c))) {
    days++;
    c = new Date(c.getTime() - 86400000);
  }
  await pool.query("UPDATE users SET best_streak = GREATEST(best_streak, ?) WHERE id = ?", [
    days,
    user.id,
  ]);

  revalidatePath("/kebun");
  revalidatePath("/kebun/lencana");
}

export async function markStageSeenAction(plantId: number, stageNo: number) {
  const user = await getSession();
  if (!user) return;
  await pool.query(
    "UPDATE plants SET last_seen_stage = ? WHERE id = ? AND user_id = ? AND last_seen_stage < ?",
    [stageNo, plantId, user.id, stageNo],
  );
  revalidatePath("/kebun");
}

export async function toggleChecklistAction(plantId: number, checklistId: number) {
  const user = await getSession();
  if (!user) return;

  const [own] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM plants WHERE id = ? AND user_id = ?",
    [plantId, user.id],
  );
  if (!own[0]) return;

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT 1 AS x FROM plant_checklist_progress WHERE plant_id = ? AND checklist_id = ?",
    [plantId, checklistId],
  );

  if (existing[0]) {
    await pool.query(
      "DELETE FROM plant_checklist_progress WHERE plant_id = ? AND checklist_id = ?",
      [plantId, checklistId],
    );
  } else {
    await pool.query(
      "INSERT INTO plant_checklist_progress (plant_id, checklist_id) VALUES (?, ?)",
      [plantId, checklistId],
    );

    // Grant the stage's milestone badge once every checklist item in it is done.
    const [stageRow] = await pool.query<RowDataPacket[]>(
      "SELECT stage_id FROM stage_checklist WHERE id = ?",
      [checklistId],
    );
    const stageId = stageRow[0]?.stage_id;
    if (stageId) {
      const [allRows] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) n FROM stage_checklist WHERE stage_id = ?",
        [stageId],
      );
      const [doneRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) n FROM plant_checklist_progress pcp
         JOIN stage_checklist sc ON sc.id = pcp.checklist_id
         WHERE pcp.plant_id = ? AND sc.stage_id = ?`,
        [plantId, stageId],
      );
      const total = Number(allRows[0]?.n ?? 0);
      const done = Number(doneRows[0]?.n ?? 0);
      if (total > 0 && total === done) {
        const [badgeRow] = await pool.query<RowDataPacket[]>(
          "SELECT badge_id FROM pack_stages WHERE id = ?",
          [stageId],
        );
        const badgeId = badgeRow[0]?.badge_id;
        if (badgeId) {
          await pool.query(
            "INSERT IGNORE INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())",
            [user.id, badgeId],
          );
        }
      }
    }
  }

  revalidatePath(`/kebun/panduan/${plantId}`);
  revalidatePath("/kebun");
  revalidatePath("/kebun/lencana");
}

export async function addJournalAction(formData: FormData) {
  const user = await getSession();
  if (!user) return;
  const plantId = Number(formData.get("plantId"));
  const text = String(formData.get("text") ?? "").trim();
  if (!plantId || !text) return;

  const [own] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM plants WHERE id = ? AND user_id = ?",
    [plantId, user.id],
  );
  if (!own[0]) return;

  await pool.query(
    "INSERT INTO journal_entries (plant_id, entry_date, text) VALUES (?, CURDATE(), ?)",
    [plantId, text],
  );
  revalidatePath(`/kebun/panduan/${plantId}`);
}
