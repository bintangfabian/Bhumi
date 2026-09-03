import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import type { Level } from "@/lib/data";

export type AdminStage = {
  id: number | string;
  title: string;
  days: string;
  media: string;
  instruction: string;
  checklist: string[];
};

export type AdminPack = {
  id: string;
  name: string;
  price: string;
  level: Level;
  days: string;
  status: "Terbit" | "Draf";
  sold: number;
  stages: AdminStage[];
};

async function getAdminStages(packId: string): Promise<AdminStage[]> {
  const [stages] = await pool.query<RowDataPacket[]>(
    "SELECT id, title, duration_days, media, instruction FROM pack_stages WHERE pack_id = ? ORDER BY stage_no",
    [packId],
  );
  const result: AdminStage[] = [];
  for (const s of stages) {
    const [checklist] = await pool.query<RowDataPacket[]>(
      "SELECT label FROM stage_checklist WHERE stage_id = ? ORDER BY sort_order",
      [s.id],
    );
    result.push({
      id: s.id,
      title: s.title,
      days: String(s.duration_days),
      media: s.media,
      instruction: s.instruction ?? "",
      checklist: checklist.map((c) => c.label),
    });
  }
  return result;
}

export async function listAdminPacks(): Promise<AdminPack[]> {
  const [packs] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, price, level, days, status, sold FROM packs ORDER BY sort_order",
  );
  const result: AdminPack[] = [];
  for (const p of packs) {
    result.push({
      id: p.id,
      name: p.name,
      price: String(p.price),
      level: p.level,
      days: String(p.days),
      status: p.status,
      sold: p.sold,
      stages: await getAdminStages(p.id),
    });
  }
  return result;
}
