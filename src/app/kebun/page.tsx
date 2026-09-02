"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GARDEN_SUMMARY, PLANTS, TASKS, WEEK_REMINDERS } from "@/lib/data";
import { ButtonLink, Container, ProgressBar } from "@/components/ui";

export default function KebunPage() {
  const [done, setDone] = useState<string[]>(
    TASKS.filter((t) => t.done).map((t) => t.id),
  );

  const toggle = (id: string) =>
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const pending = TASKS.length - done.length;

  const plants = useMemo(
    () => PLANTS.map((pl) => ({ ...pl, pct: Math.round((pl.day / pl.total) * 100) })),
    [],
  );

  return (
    <Container className="py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="kicker">Kebun Saya</span>
          <h1 className="mt-3 text-[clamp(26px,4vw,38px)]">
            Selamat pagi, Rani
          </h1>
          <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.06em] text-ink-3">
            2 tanaman aktif &nbsp;·&nbsp; {pending} tugas menunggu hari ini
          </p>
        </div>
        <ButtonLink href="/#katalog" variant="ghost" size="sm">
          + Tambah tanaman
        </ButtonLink>
      </div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Plants */}
        <div>
          <h2 className="text-[15px]">Sedang dirawat</h2>
          <div className="mt-4 space-y-4">
            {plants.map((pl) => (
              <article key={pl.id} className="border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[17px]">{pl.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em] ${
                          pl.state === "ok"
                            ? "border-line-2 text-ink-2"
                            : "border-alert/40 text-alert"
                        }`}
                      >
                        <span
                          className={`size-1.5 ${
                            pl.state === "ok" ? "bg-lime" : "bg-alert"
                          }`}
                        />
                        {pl.stateLabel}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[12px] text-ink-3">
                      Hari ke-{pl.day} · Tahap {pl.stageNo}: {pl.stageName}
                    </div>
                  </div>
                  <div className="text-right font-mono text-[12px] text-ink-3">
                    <div className="text-[18px] font-medium text-ink">
                      {pl.pct}%
                    </div>
                    panen {pl.eta}
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar pct={pl.pct} />
                  <div className="mt-3 flex gap-1.5">
                    {pl.labels.map((label, i) => (
                      <div key={label} className="flex-1">
                        <div
                          className={`h-1 ${
                            i <= pl.active ? "bg-ink" : "bg-line-2"
                          }`}
                        />
                        <div
                          className={`mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.04em] ${
                            i === pl.active ? "text-ink" : "text-ink-3"
                          }`}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
                  <span className="text-[13px] text-ink-2">{pl.todoLine}</span>
                  <Link
                    href={`/kebun/panduan/${pl.id}`}
                    className="h-9 border border-ink px-3.5 text-[13px] font-semibold leading-[34px] text-ink transition-colors hover:bg-ink hover:text-on-carbon"
                  >
                    Buka panduan
                  </Link>
                </div>
              </article>
            ))}

            <div className="flex items-center gap-4 border border-dashed border-line-2 p-4">
              <span className="font-mono text-[18px] text-ink-3">+</span>
              <div>
                <div className="text-[14px] font-semibold">
                  Paket Duo Cabai &amp; Tomat
                </div>
                <div className="font-mono text-[11.5px] text-ink-3">
                  Dipesan 28 Agt · dikirim, panduan aktif setelah paket diterima
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-8">
          <div className="border border-line bg-surface">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-[15px]">Tugas hari ini</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {done.length}/{TASKS.length}
              </span>
            </div>
            <div className="px-5 py-1.5">
              {TASKS.map((t) => {
                const isDone = done.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className="flex w-full items-start gap-3 border-b border-line py-3 text-left last:border-0"
                  >
                    <span
                      className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-xs border text-[11px] font-bold ${
                        isDone
                          ? "border-ink bg-lime text-ink"
                          : "border-line-2 bg-surface"
                      }`}
                    >
                      {isDone ? "✓" : ""}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-[14px] font-medium ${
                          isDone ? "text-ink-3 line-through" : "text-ink"
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.04em] text-ink-3">
                        {t.plant} · {t.when}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-[15px]">Pengingat minggu ini</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {WEEK_REMINDERS.map((r) => (
                <li key={r.day} className="flex gap-4 py-3">
                  <span className="w-10 shrink-0 font-mono text-[12px] font-medium uppercase text-ink">
                    {r.day}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-ink-2">
                    {r.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[15px]">Ringkasan kebun</h2>
            <dl className="mt-3 grid grid-cols-3 border-y border-line">
              {GARDEN_SUMMARY.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-4 ${i > 0 ? "border-l border-line pl-4" : ""}`}
                >
                  <dd className="font-display text-[24px] font-bold">
                    {s.value}
                  </dd>
                  <dt className="mt-0.5 text-[11.5px] leading-tight text-ink-3">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Container>
  );
}
