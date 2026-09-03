import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export const SESSION_COOKIE = "bhumi_session";

export type Role = "superadmin" | "customer";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.email, u.name, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > NOW()`,
    [token],
  );
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/** Redirects to /masuk when signed out, or to the user's home when the role doesn't match. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/masuk");
  if (role && user.role !== role) {
    redirect(user.role === "superadmin" ? "/admin" : "/kebun");
  }
  return user;
}
