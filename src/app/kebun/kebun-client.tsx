"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { photo } from "@/lib/data";
import { ButtonLink, Container, Photo, ProgressBar } from "@/components/ui";
import {
  Badge,
  HealthBars,
  HealthChip,
  StageUnlockSheet,
  StreakCard,
  TaskRow,
  WeeklyChallengeCard,
} from "@/components/gamification";
import type { Dashboard } from "@/lib/repo/garden";
import { markStageSeenAction, toggleTaskAction } from "./actions";

export function KebunClient({ dashboard }: { dashboard: Dashboard }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [done, setDone] = useState<number[]>(
    dashboard.tasks.filter((t) => t.done).map((t) => t.id),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  // The server's streak already counts today if it was fully done on load;
  // only bump the ring preview when the user just now finishes the last task.
  const [wasAllDoneOnLoad] = useState(
    dashboard.tasks.length > 0 && dashboard.tasks.every((t) => t.done),
  );

  const toggle = (id: number) => {
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    startTransition(async () => {
      await toggleTaskAction(id);
      router.refresh();
    });
  };

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    const su = dashboard.stageUnlock;
    if (su) {
      startTransition(async () => {
        await markStageSeenAction(su.plantId, su.stageNo);
        router.refresh();
      });
    }
  }, [dashboard.stageUnlock, router, startTransition]);

  useEffect(() => {
    if (!dashboard.stageUnlock) return;
    const t = setTimeout(() => setSheetOpen(true), 600);
    return () => clearTimeout(t);
    // Fires once per mount; the sheet re-appears next visit only if still unseen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = dashboard.tasks.length - done.length;
  const allDone = dashboard.tasks.length > 0 && pending === 0;
  const streakDays =
    allDone && !wasAllDoneOnLoad ? dashboard.streak.days + 1 : dashboard.streak.days;

  const recentBadges = (() => {
    const unlocked = dashboard.badges.filter((b) => b.state !== "locked");
    const nextLocked = dashboard.badges.find((b) => b.state === "locked");
    return nextLocked ? [...unlocked, nextLocked] : unlocked;
  })();
  const newBadge = dashboard.badges.find((b) => b.state === "new");

  return (
    <Container className="py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker">Kebun Saya</span>
          <h1 className="mt-3 text-[clamp(26px,4vw,38px)]">
            Selamat datang, {dashboard.userName}
          </h1>
          <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-3">
            {dashboard.plants.length} tanaman aktif &nbsp;·&nbsp;{" "}
            {dashboard.tasks.length === 0
              ? "tidak ada tugas hari ini"
              : allDone
                ? "semua tugas hari ini selesai"
                : `${pending} tugas menunggu hari ini`}
          </p>
        </div>
        <ButtonLink href="/katalog" variant="ghost" size="sm">
          + Tambah tanaman
        </ButtonLink>
      </div>

      <div className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-7">
        {/* ---------------- Left column ---------------- */}
        <div className="contents lg:block lg:space-y-5">
          {/* 1 · Active plants */}
          <section className="order-1 space-y-4">
            {dashboard.plants.length === 0 && (
              <div className="rounded-lg border border-dashed border-line-2 p-6 text-center text-[14px] text-ink-2">
                Belum ada tanaman aktif. Pesan paket dari katalog untuk mulai.
              </div>
            )}
            {dashboard.plants.map((pl) => (
              <article key={pl.id} className="rounded-lg border border-line bg-surface p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <Photo
                    src={pl.photo || photo(pl.name.toLowerCase().includes("tomat") ? "tomato,seedling,pot" : "chili,seedling,pot", pl.day)}
                    alt={pl.name}
                    ratio="1 / 1"
                    className="hidden w-14 shrink-0 rounded-xs border border-line sm:block"
                    sizes="64px"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-[22px] sm:text-[24px]">{pl.name}</h2>
                      <HealthChip health={pl.health} />
                    </div>
                    <div className="mt-1 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
                      Tahap {pl.stageNo}: {pl.stageName} · panen {pl.eta}
                    </div>
                  </div>
                  <div className="shrink-0 font-display text-[24px] font-bold leading-none tracking-[-0.02em] text-ink">
                    {pl.pct}%
                  </div>
                </div>

                <div className="mt-5">
                  <ProgressBar pct={pl.pct} />
                  <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
                    <span>
                      Hari {pl.day} / {pl.total}
                    </span>
                    <span>{pl.pct}% menuju panen</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {pl.labels.map((label, i) => (
                      <div key={label} className="flex-1">
                        <div className={`h-[2px] ${i <= pl.active ? "bg-ink" : "bg-line-2"}`} />
                        <div
                          className={`mt-2 text-center font-mono text-[10.5px] uppercase tracking-[0.1em] ${
                            i === pl.active ? "font-medium text-ink" : "text-ink-3"
                          }`}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pl.stageUnlocked && dashboard.stageUnlock && (
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="mt-5 flex w-full items-center justify-between gap-3 rounded-sm border border-lime bg-lime-wash px-4 py-3 text-left transition-colors hover:bg-lime"
                  >
                    <span>
                      <span className="block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink">
                        Tahap {dashboard.stageUnlock.stageNo} terbuka
                      </span>
                      <span className="mt-0.5 block text-[14px] text-ink-2">
                        {dashboard.stageUnlock.title} · {dashboard.stageUnlock.range}
                      </span>
                    </span>
                    <span className="shrink-0 text-[14px] font-semibold text-ink">Lihat</span>
                  </button>
                )}

                <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-[5px]">
                      <HealthBars health={pl.health} />
                    </div>
                  </div>
                  <Link
                    href={`/kebun/panduan/${pl.id}`}
                    className="inline-flex h-9 shrink-0 items-center rounded-sm border border-ink px-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-ink hover:text-on-carbon"
                  >
                    Buka panduan
                  </Link>
                </div>
              </article>
            ))}

            {dashboard.pendingOrder && (
              <div className="flex items-center gap-4 rounded-lg border border-dashed border-line-2 p-4">
                <span className="font-mono text-[18px] text-ink-3">+</span>
                <div>
                  <div className="text-[14px] font-semibold">{dashboard.pendingOrder.packName}</div>
                  <div className="font-mono text-[11.5px] text-ink-3">
                    Dipesan {dashboard.pendingOrder.orderedOn} · {dashboard.pendingOrder.status}, panduan aktif
                    setelah paket diterima
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 3 · Streak */}
          <section className="order-3">
            <StreakCard streak={dashboard.streak} days={streakDays} />
          </section>

          {/* 5 · Badges */}
          <section className="order-5 rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Lencana terbaru
              </div>
              <Link
                href="/kebun/lencana"
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-2 underline-offset-4 hover:underline"
              >
                Semua lencana
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-5">
              {recentBadges.map((b) => (
                <Badge key={b.id} badge={b} size={63} showLabel={false} />
              ))}
            </div>
            {newBadge && (
              <p className="mt-5 text-[14px] text-ink-2">
                <span className="font-semibold text-ink">{newBadge.name}</span> baru diraih{" "}
                {newBadge.earnedOn}.{" "}
                {dashboard.badges.find((b) => b.state === "locked") && (
                  <>Berikutnya: {dashboard.badges.find((b) => b.state === "locked")?.name.toLowerCase()}.</>
                )}
              </p>
            )}
          </section>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="contents lg:block lg:space-y-5">
          {/* 2 · Today's tasks */}
          <section className="order-2 overflow-hidden rounded-lg border border-ink bg-surface">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-[17px]">Tugas hari ini</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {done.length}/{dashboard.tasks.length}
              </span>
            </div>
            <div className="px-5 sm:px-6">
              {dashboard.tasks.length === 0 && (
                <p className="py-6 text-[14px] text-ink-2">Tidak ada tugas terjadwal hari ini.</p>
              )}
              {dashboard.tasks.map((t) => (
                <TaskRow
                  key={t.id}
                  title={t.title}
                  meta={`${t.plant} · ${t.when}`}
                  done={done.includes(t.id)}
                  onToggle={() => toggle(t.id)}
                />
              ))}
            </div>
            {dashboard.tasks.length > 0 && (
              <div className="border-t border-line bg-page px-5 py-4 font-mono text-[11px] font-medium uppercase leading-relaxed tracking-[0.14em] text-ink-3 sm:px-6">
                {allDone
                  ? `Hari ke-${streakDays} tercatat. Sampai besok pagi.`
                  : `Selesaikan ${pending} lagi untuk hari ke-${dashboard.streak.days + 1}`}
              </div>
            )}
          </section>

          {/* 4 · Reminders */}
          {dashboard.reminders.length > 0 && (
            <section className="order-4 rounded-lg border border-line bg-surface p-5 sm:p-6">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Pengingat minggu ini
              </div>
              <ul className="mt-3 divide-y divide-line">
                {dashboard.reminders.map((r, i) => (
                  <li key={i} className="flex gap-4 py-3 first:pt-1 last:pb-0">
                    <span className="w-10 shrink-0 font-mono text-[12px] font-medium uppercase text-ink">
                      {r.day}
                    </span>
                    <span className="text-[14px] leading-relaxed text-ink-2">{r.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 6 · Weekly challenge */}
          {dashboard.weeklyChallenge && (
            <section className="order-6">
              <WeeklyChallengeCard
                text={dashboard.weeklyChallenge.text}
                done={dashboard.weeklyChallenge.done}
                total={dashboard.weeklyChallenge.total}
              />
            </section>
          )}
        </div>
      </div>

      {dashboard.stageUnlock && (
        <StageUnlockSheet data={dashboard.stageUnlock} open={sheetOpen} onClose={closeSheet} />
      )}
    </Container>
  );
}
