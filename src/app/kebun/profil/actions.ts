"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function updateReminderSettingsAction(formData: FormData) {
  const user = await getSession();
  if (!user) return;

  const reminderTime = String(formData.get("reminderTime") ?? "09:00");
  const siramEnabled = formData.get("siramReminderEnabled") === "on";
  const tipsEnabled = formData.get("tipsEnabled") === "on";
  const quietStart = String(formData.get("quietStart") ?? "22:00");
  const quietEnd = String(formData.get("quietEnd") ?? "08:00");

  await pool.query(
    `UPDATE users
     SET reminder_time = ?, siram_reminder_enabled = ?, tips_enabled = ?, quiet_start = ?, quiet_end = ?
     WHERE id = ?`,
    [reminderTime, siramEnabled ? 1 : 0, tipsEnabled ? 1 : 0, quietStart, quietEnd, user.id],
  );
  revalidatePath("/kebun/profil");
}
