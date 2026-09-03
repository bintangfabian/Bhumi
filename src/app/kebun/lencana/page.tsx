import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getBadgesAndStreak, getDashboard } from "@/lib/repo/garden";
import { ButtonLink, Container } from "@/components/ui";
import { Badge, HealthPanel, StageTeasers, StreakCard } from "@/components/gamification";

export const metadata: Metadata = {
  title: "Lencana & streak — Bhumi",
  description:
    "Tonggak bertani yang sudah kamu lewati, cincin streak perawatan, dan indikator kesehatan tanaman.",
};

export default async function LencanaPage() {
  const user = await requireUser("customer");
  const [{ badges, streak }, dashboard] = await Promise.all([
    getBadgesAndStreak(user.id),
    getDashboard(user.id, user.name),
  ]);
  const earned = badges.filter((b) => b.state !== "locked").length;

  return (
    <Container className="py-10 lg:py-14">
      <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        <Link href="/kebun" className="hover:text-ink">
          Kebun Saya
        </Link>
        <span>/</span>
        <span className="text-ink">Lencana</span>
      </nav>

      {/* ---- Milestone badges ---- */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[clamp(26px,4vw,38px)]">Lencana tonggak</h1>
          <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
            Momen bertani, bukan momen aplikasi · {earned} dari {badges.length} diraih
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
        {badges.map((b) => (
          <div key={b.id} className="flex justify-center">
            <Badge badge={b} size={99} />
          </div>
        ))}
      </div>

      {/* ---- Streak ---- */}
      <section className="mt-16 border-t border-line pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(22px,3vw,30px)]">Streak perawatan</h2>
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-3">
            Cincin pertumbuhan batang · satu cincin tiap 6 hari
          </span>
        </div>
        <div className="mt-6 max-w-[420px]">
          <StreakCard streak={streak} />
        </div>
        <p className="mt-5 max-w-[640px] text-[14px] leading-relaxed text-ink-2">
          Satu hari terlewat memakai pelindung secara otomatis, kalau masih ada ({streak.shields}{" "}
          tersisa). Tanpa pelindung, streak mulai lagi dari 1. Tidak ada hukuman, tanamanmu tetap
          dirawat seperti biasa.
        </p>
      </section>

      {/* ---- Health indicator ---- */}
      {dashboard.plants.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="text-[clamp(22px,3vw,30px)]">Indikator kesehatan tanaman</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {dashboard.plants.map((p) => (
              <div key={p.id}>
                <div className="mb-2 text-[13px] font-semibold text-ink">{p.name}</div>
                <HealthPanel health={p.health} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Next stage ---- */}
      {dashboard.stageUnlock && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-[clamp(22px,3vw,30px)]">Tahap berikutnya</h2>
              <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-ink-2">
                Setiap tahap baru dibuka dengan menutup tahap sebelumnya: apa yang berhasil
                dilewati, lalu satu tombol ke tahap berikutnya. Tahap yang belum terbuka hanya
                diberi teaser.
              </p>
              <ButtonLink href="/kebun/panen" variant="solid" className="mt-6">
                Lihat kartu panen pertama
              </ButtonLink>
            </div>
            <StageTeasers data={dashboard.stageUnlock} />
          </div>
        </section>
      )}
    </Container>
  );
}
