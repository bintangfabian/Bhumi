"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Container, DisabledPill, Figure, LevelBadge, Photo } from "@/components/ui";
import type { CareIssue } from "@/lib/repo/learn";
import type { PackCard } from "@/lib/repo/packs";

const SEVERITY_STYLE: Record<CareIssue["severity"], string> = {
  info: "border-line-2 bg-surface text-ink-3",
  waspada: "border-ink bg-lime-wash text-ink",
  darurat: "border-alert bg-alert-wash text-alert",
};
const SEVERITY_LABEL: Record<CareIssue["severity"], string> = {
  info: "Info",
  waspada: "Kerap terjadi",
  darurat: "Butuh aksi",
};

const VIDEOS = [
  { title: "Cara cek kelembapan tanah pakai jari", duration: "01:15 menit" },
  { title: "Penyebab utama bibit mati di minggu ke-1", duration: "02:40 menit" },
];

const FAQ = [
  { q: "Bolehkah pakai air keran langsung?", a: "Boleh, asal disemprot halus (misting) — jangan disiram deras dari kran atau gayung karena bisa merusak akar tunas muda." },
  { q: "Balkon tidak kena sinar matahari langsung, bagaimana?", a: "Pilih paket yang tandanya 'Ramah Pemula'/kebutuhan sinar sedang, dan tempatkan pot sedekat mungkin ke sisi paling terang minimal 4-5 jam." },
  { q: "Berapa takaran pupuk organik pertama kali?", a: "Ikuti takaran di kartu tugas tahap yang sedang aktif — biasanya satu sendok makan dilarutkan per 2 liter air untuk polybag ukuran standar." },
];

const GLOSSARY = [
  { term: "Germinasi", stage: "Tahap 1", body: "Proses pecahnya cangkang biji dan keluarnya calon akar setelah menyerap air dan kehangatan tanah yang pas." },
  { term: "Tunas Sejati", stage: "Tahap 2", body: "Daun permanen yang tumbuh setelah daun kecambah pertama (kotiledon). Bentuknya mencerminkan daun asli tanaman dan siap berfotosintesis penuh." },
  { term: "Overwatering", stage: "Kerap keliru", body: "Kondisi media tanam terlalu basah terus-menerus hingga pori tanah kehilangan oksigen, menyebabkan akar lemas dan busuk." },
  { term: "Hardening off", stage: "Pengerasan bibit", body: "Proses mengenalkan bibit ke matahari & angin langsung secara bertahap sebelum dipindah tanam, supaya tidak stres/layu." },
];

export function BelajarClient({ issues, packs }: { issues: CareIssue[]; packs: PackCard[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("Semua");
  const [openIssue, setOpenIssue] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const kinds = useMemo(() => {
    const set = new Set(issues.map((i) => i.plantKind).filter((k) => k !== "semua"));
    return ["Semua", ...set];
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) => {
      const matchesKind = kind === "Semua" || i.plantKind === "semua" || i.plantKind === kind;
      const matchesQuery = !q || i.symptom.toLowerCase().includes(q) || i.cause.toLowerCase().includes(q);
      return matchesKind && matchesQuery;
    });
  }, [issues, query, kind]);

  return (
    <Container className="max-w-[720px] py-8 lg:py-12">
      <span className="kicker">Eksplorasi praktis</span>
      <h1 className="mt-3 text-[clamp(24px,4vw,32px)]">Pusat Belajar & Solusi Tanam</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        Panduan cerdas ramah pemula untuk merawat tanaman tanpa rasa panik.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari masalah (misal: daun kuning, hama putih, layu)…"
        className="mt-5 h-11 w-full border border-line-2 bg-surface px-3.5 text-[14px] focus:border-ink focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`h-8 rounded-sm border px-3 text-[12.5px] font-medium capitalize transition-colors ${
              kind === k ? "border-ink bg-lime text-ink" : "border-line-2 bg-surface text-ink-3 hover:border-ink hover:text-ink"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* ---- Deteksi gejala ---- */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px]">Deteksi gejala tanaman</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">Rule-based</span>
        </div>
        <p className="mt-1 text-[13px] text-ink-2">
          Pilih tanda yang muncul di tanamanmu untuk langkah penyelamatan tercepat.
        </p>
        <div className="mt-3 divide-y divide-line border-y border-line">
          {filteredIssues.length === 0 && (
            <p className="py-6 text-[13.5px] text-ink-2">Tidak ada gejala yang cocok. Coba kata kunci lain.</p>
          )}
          {filteredIssues.map((i) => {
            const open = openIssue === i.id;
            return (
              <div key={i.id}>
                <button
                  type="button"
                  onClick={() => setOpenIssue(open ? null : i.id)}
                  className="flex w-full items-center gap-3 py-3.5 text-left"
                >
                  <span className="flex-1 text-[14px] font-medium text-ink">{i.symptom}</span>
                  <span className={`shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] ${SEVERITY_STYLE[i.severity]}`}>
                    {SEVERITY_LABEL[i.severity]}
                  </span>
                  <span className="text-ink-3">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="space-y-2 pb-4 text-[13.5px] leading-relaxed text-ink-2">
                    <p><span className="font-semibold text-ink">Penyebab:</span> {i.cause}</p>
                    <p><span className="font-semibold text-ink">Tindakan:</span> {i.action}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Panduan lengkap tanaman ---- */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px]">Panduan lengkap tanaman</h2>
          <Link href="/katalog" className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2 underline-offset-4 hover:underline">
            Semua paket
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {packs.map((p) => (
            <Link
              key={p.id}
              href={`/paket/${p.id}`}
              className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-ink"
            >
              <Photo src={p.photo} alt={p.name} ratio="1 / 1" className="w-16 shrink-0 rounded-xs border border-line" sizes="64px" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <LevelBadge level={p.level} />
                  <span className="font-mono text-[11px] text-ink-3">{p.days} hari</span>
                </div>
                <div className="mt-1 text-[14.5px] font-semibold text-ink">{p.name}</div>
                <div className="font-mono text-[11px] text-ink-3">{p.stages} modul praktik</div>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-ink">Lihat →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Video tutorial ---- */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px]">Video tutorial populer</h2>
          <DisabledPill>Segera hadir</DisabledPill>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VIDEOS.map((v) => (
            <div key={v.title} className="border border-line bg-surface">
              <div className="relative">
                <Figure ratio="16 / 9" label="Pratinjau video" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-10 place-items-center rounded-full bg-carbon/70 text-on-carbon">▶</span>
                </span>
                <span className="absolute bottom-1.5 right-1.5 bg-carbon/70 px-1.5 py-0.5 font-mono text-[10px] text-on-carbon">
                  {v.duration}
                </span>
              </div>
              <div className="p-3 text-[13.5px] font-medium text-ink">{v.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mt-10" id="faq">
        <h2 className="text-[16px]">Tanya jawab cepat</h2>
        <div className="mt-3 divide-y divide-line border-y border-line">
          {FAQ.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q}>
                <button type="button" onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-3 py-3.5 text-left">
                  <span className="text-[14px] font-medium text-ink">{f.q}</span>
                  <span className="shrink-0 text-ink-3">{open ? "−" : "+"}</span>
                </button>
                {open && <p className="pb-4 text-[13.5px] leading-relaxed text-ink-2">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Kamus istilah ---- */}
      <section className="mt-10 mb-10">
        <h2 className="text-[16px]">Kamus istilah tani</h2>
        <div className="mt-3 space-y-4">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="border-l-2 border-lime pl-4">
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-semibold text-ink">{g.term}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">{g.stage}</span>
              </div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{g.body}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
