"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ensureTodayTasks } from "@/lib/repo/garden";

export type ActivateState = { error: string } | null;

/**
 * Onboarding "aktifkan starter kit" — pengganti checkout penuh untuk quick-start.
 * Membuat order (status diterima, disimulasikan langsung sampai karena belum
 * ada integrasi pembayaran/logistik nyata) + tanaman, lalu men-generate tugas
 * hari ini supaya dashboard langsung terisi.
 */
export async function activateStarterKitAction(
  _prev: ActivateState,
  formData: FormData,
): Promise<ActivateState> {
  const session = await getSession();
  if (!session) redirect("/masuk");
  const user = session;

  const packId = String(formData.get("packId") ?? "");
  const plantedOn = String(formData.get("plantedOn") ?? "");
  const reminderTime = String(formData.get("reminderTime") ?? "09:00");
  const remindersEnabled = formData.get("remindersEnabled") === "on";
  const photoUrl = String(formData.get("photoUrl") ?? "");

  if (!packId || !plantedOn) {
    return { error: "Pilih tanaman dan tanggal mulai semai terlebih dahulu." };
  }

  const [packRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, price FROM packs WHERE id = ? AND status = 'Terbit'",
    [packId],
  );
  const pack = packRows[0];
  if (!pack) return { error: "Paket tidak ditemukan." };

  await pool.query(
    "INSERT INTO orders (user_id, pack_id, qty, total, status) VALUES (?,?,1,?,'diterima')",
    [user.id, packId, pack.price],
  );

  const plantName = pack.name.replace(/^Paket\s+/i, "");
  const [plantResult] = await pool.query<ResultSetHeader>(
    "INSERT INTO plants (user_id, pack_id, name, photo_url, planted_on, health, last_seen_stage) VALUES (?,?,?,?,?,'sehat',1)",
    [user.id, packId, plantName, photoUrl, plantedOn],
  );
  const plantId = plantResult.insertId;

  if (photoUrl) {
    await pool.query(
      "INSERT INTO progress_photos (plant_id, taken_on, photo_url) VALUES (?,?,?)",
      [plantId, plantedOn, photoUrl],
    );
  }

  await pool.query(
    "UPDATE users SET reminder_time = ?, siram_reminder_enabled = ? WHERE id = ?",
    [reminderTime, remindersEnabled ? 1 : 0, user.id],
  );

  await ensureTodayTasks(plantId, packId, new Date(`${plantedOn}T00:00:00`));

  revalidatePath("/kebun");
  redirect("/kebun");
}
