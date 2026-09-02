"use client";

import { use, useState } from "react";
import Link from "next/link";
import { JOURNAL, PANDUAN, PROGRESS_PHOTOS } from "@/lib/data";
import { Button, Container, Figure, ProgressBar } from "@/components/ui";

export default function PanduanPage({
  params,
}: {
  params: Promise<{ plant: string }>;
}) {
  use(params); // route param reserved for per-plant guides
  const [stageIdx, setStageIdx] = useState(2);
  const [stageDone, setStageDone] = useState<number[][]>(
    PANDUAN.stages.map((s) => [...s.done]),
  );
  const [note, setNote] = useState("");
  const [journal, setJournal] = useState(JOURNAL);

  const stage = PANDUAN.stages[stageIdx];
  const doneList = stageDone[stageIdx] ?? [];
  const pct = Math.round((PANDUAN.day / PANDUAN.total) * 100);

  const toggleCheck = (i: number) =>
    setStageDone((prev) =>
      prev.map((arr, idx) => {
        if (idx !== stageIdx) return arr;
        return arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i];
      }),
    );

  const saveNote = () => {
    const text = note.trim();
    if (!text) return;
    setJournal((prev) => [{ date: "Hari ini", text, photo: false }, ...prev]);
    setNote("");
  };

  return (
    <Container className="py-10 lg:py-14">
      <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        <Link href="/kebun" className="hover:text-ink">
          Kebun Saya
        </Link>
        <span>/</span>
        <span className="text-ink">{PANDUAN.plant}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[clamp(24px,3.4vw,34px)]">{PANDUAN.plant}</h1>
          <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
            {PANDUAN.pack} · Hari ke-{PANDUAN.day} / {PANDUAN.total}
          </p>
        </div>
        <div className="w-full max-w-[280px]">
          <div className="flex justify-between font-mono text-[12px] text-ink-3">
            <span>
              <span className="text-ink">{pct}%</span> menuju panen
            </span>
            <span>
              Tahap {stage.no}/{PANDUAN.stages.length}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={pct} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Stage tabs */}
          <div>
            <h2 className="text-[15px]">Tahapan tanam</h2>
            <div className="mt-3 border-t border-line">
              {PANDUAN.stages.map((s, i) => {
                const active = i === stageIdx;
                const locked = s.status === "terkunci";
                return (
                  <button
                    key={s.no}
                    onClick={() => setStageIdx(i)}
                    className={`flex w-full items-center gap-3 border-b border-line py-3 text-left transition-colors ${
                      active ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-xs font-mono text-[12px] font-medium ${
                        active
                          ? "bg-lime text-ink"
                          : s.status === "selesai"
                            ? "bg-ink text-on-carbon"
                            : "border border-line-2 text-ink-3"
                      }`}
                    >
                      {s.status === "selesai" ? "✓" : s.no}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-[14px] font-semibold ${
                          locked ? "text-ink-3" : "text-ink"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="block font-mono text-[11px] uppercase tracking-[0.04em] text-ink-3">
                        {s.range}
                      </span>
                    </span>
                    {active && <span className="h-6 w-0.5 bg-lime" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px]">Checklist tahap ini</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {doneList.length}/{stage.checklist.length}
              </span>
            </div>
            <div className="mt-3 border-t border-line">
              {stage.checklist.map((label, i) => {
                const isDone = doneList.includes(i);
                return (
                  <button
                    key={label}
                    onClick={() => toggleCheck(i)}
                    className="flex w-full items-start gap-3 border-b border-line py-3 text-left"
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
                    <span
                      className={`flex-1 text-[14px] font-medium ${
                        isDone ? "text-ink-3 line-through" : "text-ink"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress photos */}
          <div>
            <h2 className="text-[15px]">Foto perkembangan</h2>
            <p className="mt-1.5 text-[13px] text-ink-2">
              Satu foto per minggu memperlihatkan perubahan tanaman.
            </p>
            <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {PROGRESS_PHOTOS.map((date) => (
                <Figure key={date} ratio="1 / 1" className="w-full border border-line">
                  <span className="absolute bottom-1.5 left-1.5 font-mono text-[10px] uppercase text-ink-3">
                    {date}
                  </span>
                </Figure>
              ))}
              <button className="grid aspect-square place-items-center gap-1 border border-dashed border-line-2 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3 hover:border-ink hover:text-ink">
                <span className="text-[16px] leading-none">+</span>
                Upload
              </button>
            </div>
          </div>

          {/* Journal */}
          <div>
            <h2 className="text-[15px]">Jurnal catatan</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catat yang kamu lihat hari ini: tinggi tanaman, warna daun, hama."
              className="mt-3 min-h-[80px] w-full resize-y border border-line-2 bg-surface p-3 text-[14px] leading-relaxed"
            />
            <div className="mt-2.5 flex gap-2.5">
              <button className="h-9 border border-line-2 bg-surface px-3.5 text-[13px] font-semibold hover:border-ink">
                + Lampirkan foto
              </button>
              <Button onClick={saveNote} variant="primary" size="sm" className="ml-auto">
                Simpan catatan
              </Button>
            </div>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {journal.map((j, i) => (
                <li key={i} className="flex items-start gap-4 py-3">
                  <span className="w-14 shrink-0 font-mono text-[11px] font-medium uppercase text-ink">
                    {j.date}
                  </span>
                  <span className="flex-1 text-[13.5px] leading-relaxed text-ink-2">
                    {j.text}
                  </span>
                  {j.photo && (
                    <Figure ratio="1 / 1" className="w-9 shrink-0 border border-line" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column — stage detail */}
        <div className="border border-line bg-surface p-6 lg:p-8">
          <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.06em]">
            <span className="bg-lime px-2 py-1 text-ink">Tahap {stage.no}</span>
            <span className="text-ink-3">{stage.range}</span>
          </div>
          <h2 className="mt-4 text-[clamp(20px,2.6vw,26px)]">{stage.title}</h2>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-2">
            {stage.intro}
          </p>

          {stage.status === "terkunci" && (
            <p className="mt-5 border-l-2 border-ink-2 bg-page px-4 py-3 text-[13.5px] leading-relaxed text-ink-2">
              Tahap ini terbuka otomatis saat tanaman memasuki hari ke-66. Kamu
              masih bisa membaca instruksinya lebih dulu.
            </p>
          )}

          <div className="mt-8 space-y-8">
            {stage.body.map((b, i) => (
              <div key={b.h}>
                <Figure
                  label={b.img}
                  ratio="16 / 9"
                  className="w-full border border-line"
                />
                <h3 className="mt-3 flex gap-2 text-[16px]">
                  <span className="font-mono text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {b.h}
                </h3>
                <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-ink-2">
                  {b.p}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <span className="text-[13px] text-ink-3">
              Ada yang tidak sesuai panduan?
            </span>
            <button className="h-9 border border-line-2 bg-surface px-3.5 text-[13px] font-semibold hover:border-ink">
              Tanya pendamping
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
