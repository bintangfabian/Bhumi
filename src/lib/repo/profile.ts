import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { idDate } from "@/lib/format";

export type ProfileSettings = {
  reminderTime: string;
  siramReminderEnabled: boolean;
  tipsEnabled: boolean;
  quietStart: string;
  quietEnd: string;
};

export type ProfileData = {
  name: string;
  email: string;
  joinedOn: string;
  settings: ProfileSettings;
};

const hm = (t: string) => t.slice(0, 5);

export async function getProfile(userId: number): Promise<ProfileData | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT name, email, created_at, reminder_time, siram_reminder_enabled,
            tips_enabled, quiet_start, quiet_end
     FROM users WHERE id = ?`,
    [userId],
  );
  const u = rows[0];
  if (!u) return null;
  return {
    name: u.name,
    email: u.email,
    joinedOn: idDate(new Date(u.created_at.replace(" ", "T"))),
    settings: {
      reminderTime: hm(u.reminder_time),
      siramReminderEnabled: !!u.siram_reminder_enabled,
      tipsEnabled: !!u.tips_enabled,
      quietStart: hm(u.quiet_start),
      quietEnd: hm(u.quiet_end),
    },
  };
}

export type HarvestedPlant = {
  id: number;
  name: string;
  pack: string;
  plantedOn: string;
  harvestedOn: string;
  photo: string;
  days: number;
};

export async function listHarvestedPlants(userId: number): Promise<HarvestedPlant[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.name, p.photo_url, p.planted_on, p.harvested_on, pk.name AS pack_name
     FROM plants p JOIN packs pk ON pk.id = p.pack_id
     WHERE p.user_id = ? AND p.harvested_on IS NOT NULL
     ORDER BY p.harvested_on DESC`,
    [userId],
  );
  return rows.map((r) => {
    const plantedOn = new Date(`${r.planted_on}T00:00:00`);
    const harvestedOn = new Date(`${r.harvested_on}T00:00:00`);
    return {
      id: r.id,
      name: r.name,
      pack: r.pack_name,
      plantedOn: idDate(plantedOn),
      harvestedOn: idDate(harvestedOn),
      photo: r.photo_url,
      days: Math.floor((harvestedOn.getTime() - plantedOn.getTime()) / 86400000) + 1,
    };
  });
}
