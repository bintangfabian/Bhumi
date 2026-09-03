import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { addDays, idDate, idDay, mondayOf, todayStart, ymd } from "@/lib/format";
import type {
  BadgeState,
  Health,
  MilestoneBadge,
  StageUnlock,
  Streak,
  StreakVariant,
  WeekDay,
} from "@/lib/gamification";

/* ---------- shared: streak & badges ---------- */

async function computeStreak(
  userId: number,
  best: number,
  shields: number,
): Promise<Streak> {
  const [logs] = await pool.query<RowDataPacket[]>(
    "SELECT log_date, kind FROM care_logs WHERE user_id = ?",
    [userId],
  );
  const byDate = new Map<string, "done" | "shield">();
  for (const l of logs) byDate.set(l.log_date, l.kind);

  const today = todayStart();
  const todayStr = ymd(today);

  let days = 0;
  let usedShield = false;
  let c = addDays(today, -1);
  while (byDate.has(ymd(c))) {
    if (byDate.get(ymd(c)) === "shield") usedShield = true;
    days++;
    c = addDays(c, -1);
  }
  if (byDate.has(todayStr)) {
    if (byDate.get(todayStr) === "shield") usedShield = true;
    days++;
  }

  let variant: StreakVariant;
  if (days <= 1) variant = "mulai";
  else if (usedShield) variant = "pelindung";
  else if (days >= best) variant = "rekor";
  else variant = "aktif";

  const mon = mondayOf(today);
  const week: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const k = byDate.get(ymd(addDays(mon, i)));
    week.push(k === "done" ? "done" : k === "shield" ? "shield" : "pending");
  }
  const pendingDays = week.filter((w) => w === "pending").length;

  const NOTES: Record<StreakVariant, string> = {
    rekor: "Streak terpanjang sejauh ini. Terus dijaga setiap hari.",
    pelindung: "Ada hari yang terlewat, pelindung dipakai otomatis. Hitungan tetap jalan.",
    mulai:
      days === 0
        ? "Belum ada catatan hari ini. Selesaikan tugas untuk memulai streak."
        : "Streak mulai lagi dari 1. Tanaman kamu masih baik-baik saja.",
    aktif: `${Math.floor(days / 6)} cincin penuh. ${pendingDays} hari minggu ini masih menunggu.`,
  };

  return {
    days,
    best: Math.max(best, days),
    variant,
    week,
    shields,
    note: NOTES[variant],
  };
}

async function computeBadges(userId: number): Promise<MilestoneBadge[]> {
  const [badges] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, icon, sort_order FROM badges ORDER BY sort_order",
  );
  const [earned] = await pool.query<RowDataPacket[]>(
    "SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?",
    [userId],
  );
  const earnedMap = new Map(earned.map((e) => [e.badge_id, e.earned_at as string]));
  const now = Date.now();

  return badges.map((b) => {
    const at = earnedMap.get(b.id);
    if (!at) {
      return { id: b.id, name: b.name, icon: b.icon, state: "locked" as BadgeState };
    }
    const earnedDate = new Date(at.replace(" ", "T"));
    const state: BadgeState = now - earnedDate.getTime() < 48 * 3600 * 1000 ? "new" : "earned";
    return { id: b.id, name: b.name, icon: b.icon, state, earnedOn: idDate(earnedDate) };
  });
}

/* ---------- shared: pack stage timeline ---------- */

type StageRow = {
  id: number;
  stage_no: number;
  title: string;
  short_label: string;
  duration_days: number;
  badge_id: string | null;
};

async function getPackStages(packId: string): Promise<StageRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, stage_no, title, short_label, duration_days, badge_id
     FROM pack_stages WHERE pack_id = ? ORDER BY stage_no`,
    [packId],
  );
  return rows as unknown as StageRow[];
}

function currentStageIndex(stages: { duration_days: number }[], day: number) {
  let start = 1;
  for (let i = 0; i < stages.length; i++) {
    const end = start + stages[i].duration_days - 1;
    if (day <= end) return i;
    start = end + 1;
  }
  return Math.max(0, stages.length - 1);
}

async function buildStageUnlock(
  plantId: number,
  plantName: string,
  stages: StageRow[],
  idx: number,
): Promise<StageUnlock> {
  const stage = stages[idx];
  const prev = stages[idx - 1];

  let recap: string[] = [];
  if (prev) {
    const [items] = await pool.query<RowDataPacket[]>(
      "SELECT label FROM stage_checklist WHERE stage_id = ? ORDER BY sort_order",
      [prev.id],
    );
    recap = items.map((i) => i.label);
  }

  const [stageDetail] = await pool.query<RowDataPacket[]>(
    "SELECT description FROM pack_stages WHERE id = ?",
    [stage.id],
  );

  let start = 1;
  for (let i = 0; i < idx; i++) start += stages[i].duration_days;
  const end = start + stage.duration_days - 1;

  const teasers = [];
  for (let i = idx + 1; i < Math.min(stages.length, idx + 3); i++) {
    teasers.push({
      title: `Tahap ${stages[i].stage_no} — ${stages[i].title}`,
      when:
        i === idx + 1
          ? `Terbuka dalam ${stage.duration_days} hari`
          : `Terbuka setelah tahap ${stages[i - 1].stage_no} selesai`,
      pct: 0,
    });
  }

  return {
    plantId,
    plantName,
    stageNo: stage.stage_no,
    range: `Hari ${start}–${end}`,
    title: stage.title,
    body: stageDetail[0]?.description ?? "",
    recap,
    teasers,
  };
}

/* ---------- dashboard (Kebun Saya) ---------- */

export type DashboardPlant = {
  id: number;
  name: string;
  photo: string;
  day: number;
  total: number;
  stageNo: number;
  stageName: string;
  eta: string;
  labels: string[];
  active: number;
  todoLine: string;
  health: Health;
  stageUnlocked: boolean;
  pct: number;
};

export type DashboardTask = {
  id: number;
  title: string;
  plant: string;
  when: string;
  done: boolean;
};

export type Dashboard = {
  userName: string;
  plants: DashboardPlant[];
  tasks: DashboardTask[];
  reminders: { day: string; text: string }[];
  streak: Streak;
  badges: MilestoneBadge[];
  weeklyChallenge: { text: string; done: number; total: number } | null;
  stageUnlock: StageUnlock | null;
  pendingOrder: { packName: string; status: string; orderedOn: string } | null;
};

export async function getDashboard(userId: number, userName: string): Promise<Dashboard> {
  const today = todayStart();

  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT best_streak, shields FROM users WHERE id = ?",
    [userId],
  );
  const u = userRows[0];

  const [plantRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, pack_id, name, photo_url, planted_on, health, last_seen_stage
     FROM plants WHERE user_id = ? AND harvested_on IS NULL ORDER BY id`,
    [userId],
  );

  const plants: DashboardPlant[] = [];
  let stageUnlock: StageUnlock | null = null;

  for (const p of plantRows) {
    const stages = await getPackStages(p.pack_id);
    if (stages.length === 0) continue;

    const total = stages.reduce((n, s) => n + s.duration_days, 0);
    const plantedOn = new Date(`${p.planted_on}T00:00:00`);
    const rawDay = Math.floor((today.getTime() - plantedOn.getTime()) / 86400000) + 1;
    const day = Math.min(Math.max(1, rawDay), total);
    const idx = currentStageIndex(stages, day);
    const stage = stages[idx];
    const eta = idDate(addDays(plantedOn, total - 1));

    const [taskAgg] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) n, SUM(done_at IS NOT NULL) d FROM plant_tasks WHERE plant_id = ? AND task_date = ?",
      [p.id, ymd(today)],
    );
    const totalTasks = Number(taskAgg[0]?.n ?? 0);
    const doneTasks = Number(taskAgg[0]?.d ?? 0);
    const pendingTasks = totalTasks - doneTasks;

    const unlocked = idx + 1 > p.last_seen_stage;
    if (unlocked && !stageUnlock) {
      stageUnlock = await buildStageUnlock(p.id, p.name, stages, idx);
    }

    plants.push({
      id: p.id,
      name: p.name,
      photo: p.photo_url,
      day,
      total,
      stageNo: stage.stage_no,
      stageName: stage.title,
      eta,
      labels: stages.map((s) => s.short_label),
      active: idx,
      todoLine:
        totalTasks === 0
          ? "Tidak ada tugas hari ini"
          : pendingTasks > 0
            ? `${pendingTasks} tugas hari ini`
            : "Semua tugas hari ini selesai",
      health: p.health,
      stageUnlocked: unlocked,
      pct: Math.round((day / total) * 100),
    });
  }

  const [taskRows] = await pool.query<RowDataPacket[]>(
    `SELECT pt.id, pt.title, pt.when_label, pt.done_at, p.name AS plant_name
     FROM plant_tasks pt JOIN plants p ON p.id = pt.plant_id
     WHERE p.user_id = ? AND pt.task_date = ? ORDER BY p.id, pt.sort_order`,
    [userId, ymd(today)],
  );
  const tasks: DashboardTask[] = taskRows.map((t) => ({
    id: t.id,
    title: t.title,
    plant: t.plant_name,
    when: t.when_label,
    done: !!t.done_at,
  }));

  const [reminderRows] = await pool.query<RowDataPacket[]>(
    "SELECT remind_on, text FROM reminders WHERE user_id = ? AND remind_on >= ? ORDER BY remind_on LIMIT 4",
    [userId, ymd(today)],
  );
  const reminders = reminderRows.map((r) => ({
    day: idDay(new Date(`${r.remind_on}T00:00:00`)),
    text: r.text,
  }));

  const streak = await computeStreak(userId, u?.best_streak ?? 0, u?.shields ?? 0);
  const badges = await computeBadges(userId);

  const [challengeRows] = await pool.query<RowDataPacket[]>(
    "SELECT text, target FROM weekly_challenges WHERE user_id = ? AND week_start = ?",
    [userId, ymd(mondayOf(today))],
  );
  let weeklyChallenge: Dashboard["weeklyChallenge"] = null;
  if (challengeRows[0]) {
    const [doneRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) n FROM care_logs WHERE user_id = ? AND kind = 'done' AND log_date >= ?",
      [userId, ymd(mondayOf(today))],
    );
    weeklyChallenge = {
      text: challengeRows[0].text,
      done: Math.min(challengeRows[0].target, Number(doneRows[0]?.n ?? 0)),
      total: challengeRows[0].target,
    };
  }

  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT o.status, o.ordered_at, pk.name AS pack_name FROM orders o
     JOIN packs pk ON pk.id = o.pack_id WHERE o.user_id = ? AND o.status != 'diterima'
     ORDER BY o.ordered_at DESC LIMIT 1`,
    [userId],
  );
  const pendingOrder = orderRows[0]
    ? {
        packName: orderRows[0].pack_name,
        status: orderRows[0].status,
        orderedOn: idDate(new Date(orderRows[0].ordered_at.replace(" ", "T"))),
      }
    : null;

  return { userName, plants, tasks, reminders, streak, badges, weeklyChallenge, stageUnlock, pendingOrder };
}

/* ---------- lencana page ---------- */

export async function getBadgesAndStreak(userId: number) {
  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT best_streak, shields FROM users WHERE id = ?",
    [userId],
  );
  const u = userRows[0];
  const [badges, streak] = await Promise.all([
    computeBadges(userId),
    computeStreak(userId, u?.best_streak ?? 0, u?.shields ?? 0),
  ]);
  return { badges, streak };
}

/* ---------- panen (harvest card) page ---------- */

export type HarvestCardData = {
  plant: string;
  day: number;
  streak: number;
  badges: number;
  photo: string;
};

export async function getHarvestCard(userId: number): Promise<HarvestCardData | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT name, photo_url, planted_on, harvested_on FROM plants
     WHERE user_id = ? AND harvested_on IS NOT NULL ORDER BY harvested_on DESC LIMIT 1`,
    [userId],
  );
  const p = rows[0];
  if (!p) return null;

  const plantedOn = new Date(`${p.planted_on}T00:00:00`);
  const harvestedOn = new Date(`${p.harvested_on}T00:00:00`);
  const day = Math.floor((harvestedOn.getTime() - plantedOn.getTime()) / 86400000) + 1;

  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT best_streak FROM users WHERE id = ?",
    [userId],
  );
  const [badgeRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM user_badges WHERE user_id = ?",
    [userId],
  );

  return {
    plant: p.name,
    day,
    streak: userRows[0]?.best_streak ?? 0,
    badges: Number(badgeRows[0]?.n ?? 0),
    photo: p.photo_url,
  };
}

/* ---------- panduan (per-plant guide) page ---------- */

export type GuideStageData = {
  no: number;
  id: number;
  title: string;
  range: string;
  status: "selesai" | "aktif" | "terkunci";
  intro: string;
  body: { h: string; p: string; img: string; photo: string }[];
  checklist: { id: number; label: string }[];
  done: number[];
};

export type GuideData = {
  plantId: number;
  plant: string;
  pack: string;
  day: number;
  total: number;
  stages: GuideStageData[];
  journal: { id: number; date: string; text: string; photo: string | null }[];
  progressPhotos: { date: string; photo: string }[];
};

export async function getGuide(userId: number, plantId: number): Promise<GuideData | null> {
  const [plantRows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.pack_id, p.name, p.planted_on, pk.name AS pack_name
     FROM plants p JOIN packs pk ON pk.id = p.pack_id WHERE p.id = ? AND p.user_id = ?`,
    [plantId, userId],
  );
  const plant = plantRows[0];
  if (!plant) return null;

  const [stageRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, stage_no, title, duration_days, description
     FROM pack_stages WHERE pack_id = ? ORDER BY stage_no`,
    [plant.pack_id],
  );
  const stageIds = stageRows.map((s) => s.id);

  const [sections] = stageIds.length
    ? await pool.query<RowDataPacket[]>(
        "SELECT stage_id, heading, body, img_label, photo_url FROM stage_sections WHERE stage_id IN (?) ORDER BY sort_order",
        [stageIds],
      )
    : [[] as RowDataPacket[]];
  const [checklist] = stageIds.length
    ? await pool.query<RowDataPacket[]>(
        "SELECT id, stage_id, label FROM stage_checklist WHERE stage_id IN (?) ORDER BY sort_order",
        [stageIds],
      )
    : [[] as RowDataPacket[]];
  const [progress] = await pool.query<RowDataPacket[]>(
    "SELECT checklist_id FROM plant_checklist_progress WHERE plant_id = ?",
    [plantId],
  );
  const doneSet = new Set(progress.map((r) => r.checklist_id));

  const total = stageRows.reduce((n, s) => n + s.duration_days, 0);
  const plantedOn = new Date(`${plant.planted_on}T00:00:00`);
  const rawDay = Math.floor((todayStart().getTime() - plantedOn.getTime()) / 86400000) + 1;
  const day = Math.min(Math.max(1, rawDay), total);
  const idx = currentStageIndex(
    stageRows.map((s) => ({ duration_days: s.duration_days as number })),
    day,
  );

  let cursor = 1;
  const stages: GuideStageData[] = stageRows.map((s, i) => {
    const start = cursor;
    const end = cursor + s.duration_days - 1;
    cursor = end + 1;
    const status: GuideStageData["status"] = i < idx ? "selesai" : i === idx ? "aktif" : "terkunci";
    const stageChecklist = checklist
      .filter((c) => c.stage_id === s.id)
      .map((c) => ({ id: c.id, label: c.label }));
    return {
      no: s.stage_no,
      id: s.id,
      title: s.title,
      range: `Hari ${start} – ${end}`,
      status,
      intro: s.description ?? "",
      body: sections
        .filter((x) => x.stage_id === s.id)
        .map((x) => ({ h: x.heading, p: x.body, img: x.img_label, photo: x.photo_url })),
      checklist: stageChecklist,
      done: stageChecklist.filter((c) => doneSet.has(c.id)).map((c) => c.id),
    };
  });

  const [journalRows] = await pool.query<RowDataPacket[]>(
    "SELECT id, entry_date, text, photo_url FROM journal_entries WHERE plant_id = ? ORDER BY entry_date DESC, id DESC LIMIT 12",
    [plantId],
  );
  const journal = journalRows.map((j) => ({
    id: j.id,
    date: idDate(new Date(`${j.entry_date}T00:00:00`)),
    text: j.text,
    photo: j.photo_url,
  }));

  const [photoRows] = await pool.query<RowDataPacket[]>(
    "SELECT taken_on, photo_url FROM progress_photos WHERE plant_id = ? ORDER BY taken_on DESC LIMIT 6",
    [plantId],
  );
  const progressPhotos = photoRows.map((p) => ({
    date: idDate(new Date(`${p.taken_on}T00:00:00`)),
    photo: p.photo_url,
  }));

  return {
    plantId: plant.id,
    plant: plant.name,
    pack: plant.pack_name,
    day,
    total,
    stages,
    journal,
    progressPhotos,
  };
}
