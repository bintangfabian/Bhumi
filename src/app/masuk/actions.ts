"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Isi email dan kata sandi." };
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, password_hash, role FROM users WHERE email = ?",
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Email atau kata sandi salah." };
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)",
    [token, user.id, expires],
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  redirect(user.role === "superadmin" ? "/admin" : "/kebun");
}

export async function logoutAction() {
  "use server";
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await pool.query("DELETE FROM sessions WHERE token = ?", [token]);
  jar.delete(SESSION_COOKIE);
  redirect("/masuk");
}
