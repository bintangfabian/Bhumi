import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ButtonLink, Container } from "@/components/ui";

export default async function TrackingPage() {
  const user = await requireUser("customer");

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM plants WHERE user_id = ? AND harvested_on IS NULL ORDER BY id LIMIT 1",
    [user.id],
  );
  const plantId = rows[0]?.id;
  if (plantId) redirect(`/kebun/panduan/${plantId}`);

  return (
    <Container className="py-16 text-center">
      <span className="kicker">Tracking</span>
      <h1 className="mt-3 text-[26px]">Belum ada tanaman aktif</h1>
      <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-ink-2">
        Aktifkan starter kit dulu supaya linimasa pertumbuhan dan pencapaianmu bisa dilacak di sini.
      </p>
      <ButtonLink href="/kebun/mulai" variant="primary" className="mt-6">
        Mulai petualangan menanam
      </ButtonLink>
    </Container>
  );
}
