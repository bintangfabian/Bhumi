import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB — disk lokal mesin ini terbatas.
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Terima satu file (`photo`) lewat multipart form-data, simpan ke public/uploads, kembalikan { url }. */
export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Tidak ada foto." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format harus JPG, PNG, atau WEBP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran foto maksimal 4 MB." }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
