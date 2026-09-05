import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export type CareIssue = {
  id: number;
  plantKind: string;
  symptom: string;
  cause: string;
  action: string;
  severity: "info" | "waspada" | "darurat";
};

export async function listCareIssues(): Promise<CareIssue[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, plant_kind, symptom, cause, action, severity FROM care_issues ORDER BY sort_order",
  );
  return rows.map((r) => ({
    id: r.id,
    plantKind: r.plant_kind,
    symptom: r.symptom,
    cause: r.cause,
    action: r.action,
    severity: r.severity,
  }));
}
