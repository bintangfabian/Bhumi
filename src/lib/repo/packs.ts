import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { rupiah } from "@/lib/format";
import type { Level } from "@/lib/data";

export type PackCard = {
  id: string;
  name: string;
  tagline: string;
  level: Level;
  days: number;
  stages: number;
  price: string;
  priceValue: number;
  isNew: boolean;
  photo: string;
  isi: string[];
  successRate: number;
  effort: string;
  sun: string;
};

export async function listCatalogPacks(): Promise<PackCard[]> {
  const [packs] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, tagline, level, days, price, is_new, photo_url, success_rate, effort, sun
     FROM packs WHERE status = 'Terbit' ORDER BY sort_order`,
  );
  if (packs.length === 0) return [];

  const ids = packs.map((p) => p.id);
  const [highlights] = await pool.query<RowDataPacket[]>(
    `SELECT pack_id, label FROM pack_highlights WHERE pack_id IN (?) ORDER BY sort_order`,
    [ids],
  );
  const [stageCounts] = await pool.query<RowDataPacket[]>(
    `SELECT pack_id, COUNT(*) AS n FROM pack_stages WHERE pack_id IN (?) GROUP BY pack_id`,
    [ids],
  );

  const isiByPack = new Map<string, string[]>();
  for (const h of highlights) {
    const arr = isiByPack.get(h.pack_id) ?? [];
    arr.push(h.label);
    isiByPack.set(h.pack_id, arr);
  }
  const stagesByPack = new Map<string, number>();
  for (const s of stageCounts) stagesByPack.set(s.pack_id, Number(s.n));

  return packs.map((p) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    level: p.level,
    days: p.days,
    stages: stagesByPack.get(p.id) ?? 0,
    price: rupiah(p.price),
    priceValue: p.price,
    isNew: !!p.is_new,
    photo: p.photo_url,
    isi: isiByPack.get(p.id) ?? [],
    successRate: p.success_rate,
    effort: p.effort,
    sun: p.sun,
  }));
}

export type PackDetail = PackCard & {
  harvestRange: string;
  thumbs: { label: string; photo: string }[];
  kit: { name: string; desc: string; qty: string }[];
  guide: {
    no: number;
    range: string;
    title: string;
    desc: string;
    img: string;
    photo: string;
    tasks: number;
  }[];
};

export async function getPackDetail(id: string): Promise<PackDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, tagline, level, days, price, is_new, status, photo_url, effort, sun, success_rate
     FROM packs WHERE id = ?`,
    [id],
  );
  const p = rows[0];
  if (!p || p.status !== "Terbit") return null;

  const [highlights] = await pool.query<RowDataPacket[]>(
    "SELECT label FROM pack_highlights WHERE pack_id = ? ORDER BY sort_order",
    [id],
  );
  const [kit] = await pool.query<RowDataPacket[]>(
    "SELECT name, description, qty FROM pack_kit_items WHERE pack_id = ? ORDER BY sort_order",
    [id],
  );
  const [gallery] = await pool.query<RowDataPacket[]>(
    "SELECT label, photo_url FROM pack_gallery WHERE pack_id = ? ORDER BY sort_order",
    [id],
  );
  const [stages] = await pool.query<RowDataPacket[]>(
    `SELECT id, stage_no, title, description, duration_days, photo_url
     FROM pack_stages WHERE pack_id = ? ORDER BY stage_no`,
    [id],
  );

  let cursor = 1;
  const guide = [];
  for (const s of stages) {
    const [taskCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS n FROM stage_daily_tasks WHERE stage_id = ?",
      [s.id],
    );
    const start = cursor;
    const end = cursor + s.duration_days - 1;
    guide.push({
      no: s.stage_no,
      range: `Hari ${start} – ${end}`,
      title: s.title,
      desc: s.description ?? "",
      img: `foto: ${s.title.toLowerCase()}`,
      photo: s.photo_url,
      tasks: Number(taskCount[0]?.n ?? 0),
    });
    cursor = end + 1;
  }

  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    level: p.level,
    days: p.days,
    stages: stages.length,
    price: rupiah(p.price),
    priceValue: p.price,
    isNew: !!p.is_new,
    photo: p.photo_url,
    isi: highlights.map((h) => h.label),
    harvestRange: `${p.days - 8}–${p.days + 7} hari`,
    effort: p.effort,
    sun: p.sun,
    successRate: p.success_rate,
    thumbs: gallery.map((g) => ({ label: g.label, photo: g.photo_url })),
    kit: kit.map((k) => ({ name: k.name, desc: k.description, qty: k.qty })),
    guide,
  };
}

