"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { photo } from "@/lib/data";
import { Button, Container, Photo, ProgressBar } from "@/components/ui";
import { Badge } from "@/components/gamification";
import type { GuideData } from "@/lib/repo/garden";
import { addJournalAction, toggleChecklistAction } from "@/app/kebun/actions";

export function PanduanClient({ guide }: { guide: GuideData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialIdx = Math.max(
    0,
    guide.stages.findIndex((s) => s.status === "aktif"),
  );
  const [stageIdx, setStageIdx] = useState(initialIdx);
  const [doneMap, setDoneMap] = useState<Record<number, number[]>>(() =>
    Object.fromEntries(guide.stages.map((s) => [s.id, s.done])),
  );
  const [note, setNote] = useState("");
  const [journal, setJournal] = useState(guide.journal);
  const [shared, setShared] = useState<"idle" | "done" | "copied">("idle");

  const shareText = `Progres ${guide.plant} hari ke-${guide.day} dari ${guide.total} di Bhumi. Ikuti perjalanannya!`;
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Progres tanaman", text: shareText });
        setShared("done");
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShared("copied");
    } catch {
      /* user dismissed the share sheet */
    }
  }

  const stage = guide.stages[stageIdx];
  const doneList = doneMap[stage.id] ?? [];
  const pct = Math.round((guide.day / guide.total) * 100);

  const toggleCheck = (checklistId: number) => {
    setDoneMap((prev) => {
      const cur = prev[stage.id] ?? [];
      const next = cur.includes(checklistId)
        ? cur.filter((x) => x !== checklistId)
        : [...cur, checklistId];
      return { ...prev, [stage.id]: next };
    });
    startTransition(async () => {
      await toggleChecklistAction(guide.plantId, checklistId);
      router.refresh();
    });
  };

  const saveNote = () => {
    const text = note.trim();
    if (!text) return;
    setJournal((prev) => [{ id: -Date.now(), date: "Hari ini", text, photo: null }, ...prev]);
    setNote("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("plantId", String(guide.plantId));
      fd.set("text", text);
      await addJournalAction(fd);
      router.refresh();
    });
  };

  const progressPhotos = useMemo(
    () => guide.progressPhotos.map((p, i) => ({ ...p, key: `${p.date}-${i}` })),
    [guide.progressPhotos],
  );

  return (
    <Container className="py-10 lg:py-14">
      <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        <Link href="/kebun" className="hover:text-ink">
          Kebun Saya
        </Link>
        <span>/</span>
        <span className="text-ink">{guide.plant}</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[clamp(24px,3.4vw,34px)]">{guide.plant}</h1>
          <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
            {guide.pack} · Hari ke-{guide.day} / {guide.total}
          </p>
        </div>
        <div className="w-full max-w-[280px]">
          <div className="flex justify-between font-mono text-[12px] text-ink-3">
            <span>
              <span className="text-ink">{pct}%</span> menuju panen
            </span>
            <span>
              Tahap {stage.no}/{guide.stages.length}
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
              {guide.stages.map((s, i) => {
                const active = i === stageIdx;
                const locked = s.status === "terkunci";
                return (
                  <button
                    key={s.id}
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
              {stage.checklist.map((item) => {
                const isDone = doneList.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
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
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pencapaian berkebun */}
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px]">Pencapaian berkebun</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {guide.badges.filter((b) => b.state !== "locked").length}/{guide.badges.length} diraih
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-5">
              {guide.badges.map((b) => (
                <Badge key={b.id} badge={b} size={56} showLabel />
              ))}
            </div>
          </div>

          {/* Progress photos */}
          <div>
            <h2 className="text-[15px]">Foto perkembangan</h2>
            <p className="mt-1.5 text-[13px] text-ink-2">
              Satu foto per minggu memperlihatkan perubahan tanaman.
            </p>
            <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
              {progressPhotos.map((p, i) => (
                <Photo
                  key={p.key}
                  src={p.photo || photo("chili,seedling,pot", 50 + i)}
                  alt={`Perkembangan ${p.date}`}
                  ratio="1 / 1"
                  className="border border-line"
                  sizes="120px"
                >
                  <span className="absolute bottom-1.5 left-1.5 bg-carbon/70 px-1 font-mono text-[10px] uppercase text-on-carbon">
                    {p.date}
                  </span>
                </Photo>
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
              {journal.map((j) => (
                <li key={j.id} className="flex items-start gap-4 py-3">
                  <span className="w-14 shrink-0 font-mono text-[11px] font-medium uppercase text-ink">
                    {j.date}
                  </span>
                  <span className="flex-1 text-[13.5px] leading-relaxed text-ink-2">
                    {j.text}
                  </span>
                  {j.photo && (
                    <Photo
                      src={j.photo}
                      alt={`Foto jurnal ${j.date}`}
                      ratio="1 / 1"
                      className="w-9 shrink-0 border border-line"
                      sizes="40px"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={share}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-lime text-[14px] font-semibold text-ink transition-colors hover:bg-lime-deep"
          >
            {shared === "copied" ? "Teks progres tersalin" : shared === "done" ? "Dibagikan" : "Bagikan progres"}
          </button>
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
              Tahap ini terbuka otomatis begitu tanaman mencapai hari ke-{stage.range.split(" ")[1]}.
              Kamu masih bisa membaca instruksinya lebih dulu.
            </p>
          )}

          <div className="mt-8 space-y-8">
            {stage.body.map((b, i) => (
              <div key={b.h}>
                <Photo
                  src={b.photo || photo("chili,plant,gardening", stage.no * 10 + i)}
                  alt={b.h}
                  ratio="16 / 9"
                  className="border border-line"
                  sizes="(max-width: 1024px) 100vw, 55vw"
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
