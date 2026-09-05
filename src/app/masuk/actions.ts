"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

export type LoginState = { error: string } | null;

async function createSession(userId: number, rememberMe: boolean) {
  const token = randomBytes(32).toString("hex");
  const days = rememberMe ? 90 : 30;
  const expires = new Date(Date.now() + days * 24 * 3600 * 1000);
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)",
    [token, userId, expires],
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Tujuan setelah masuk: superadmin → panel admin, customer baru tanpa tanaman/pesanan → onboarding. */
async function destinationFor(userId: number, role: "superadmin" | "customer") {
  if (role === "superadmin") return "/admin";
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       (SELECT COUNT(*) FROM plants WHERE user_id = ?) AS plants,
       (SELECT COUNT(*) FROM orders WHERE user_id = ?) AS orders`,
    [userId, userId],
  );
  const has = Number(rows[0]?.plants ?? 0) > 0 || Number(rows[0]?.orders ?? 0) > 0;
  return has ? "/kebun" : "/kebun/mulai";
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";
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

  await createSession(user.id, rememberMe);
  redirect(await destinationFor(user.id, user.role));
}

export async function registerAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) {
    return { error: "Lengkapi nama, email, dan kata sandi." };
  }
  if (password.length < 6) {
    return { error: "Kata sandi minimal 6 karakter." };
  }
  if (password !== confirm) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ?",
    [email],
  );
  if (existing[0]) {
    return { error: "Email ini sudah terdaftar. Coba masuk." };
  }

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (email, password_hash, name, role) VALUES (?,?,?,'customer')",
    [email, hash, name],
  );
  const userId = result.insertId;

  await createSession(userId, false);
  redirect("/kebun/mulai");
}

export async function logoutAction() {
  "use server";
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await pool.query("DELETE FROM sessions WHERE token = ?", [token]);
  jar.delete(SESSION_COOKIE);
  redirect("/masuk");
}
