"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DIFFS, DURS, SORTS, type SortBy } from "@/lib/catalog-filters";
import type { PackCard } from "@/lib/repo/packs";
import type { Level } from "@/lib/data";
import { Container, LevelBadge, Photo } from "@/components/ui";

export function KatalogClient({ packs: PACKS }: { packs: PackCard[] }) {
  const [diff, setDiff] = useState<Level | "Semua">("Semua");
  const [dur, setDur] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<SortBy>("Panen tercepat");

  const packs = useMemo(() => {
    const durDef = DURS.find((d) => d.label === dur) ?? DURS[0];
    let list = PACKS.filter(
      (p) => (diff === "Semua" || p.level === diff) && durDef.test(p.days),
    );
    if (sortBy === "Panen tercepat") list = [...list].sort((a, b) => a.days - b.days);
    else if (sortBy === "Harga terendah")
      list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    return list;
  }, [diff, dur, sortBy, PACKS]);

  return (
    <Container className="py-12 lg:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="max-w-[46ch]">
          <span className="kicker">Katalog</span>
          <h1 className="mt-3 text-[clamp(28px,4vw,42px)]">Paket bertani</h1>
          <p className="mt-3 text-ink-2">
            Mulai dari cabai dan tomat, tanaman paling ramah untuk pemula. Setiap
            paket sudah termasuk panduan digital sampai panen pertama.
          </p>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-ink-3">
          Urutkan
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 border border-line-2 bg-surface px-2.5 text-[13px] font-medium text-ink"
          >
            {SORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:gap-10">
        <FilterRow
          label="Tingkat"
          options={DIFFS}
          active={diff}
          onSelect={(v) => setDiff(v as Level | "Semua")}
        />
        <FilterRow
          label="Durasi"
          options={DURS.map((d) => d.label)}
          active={dur}
          onSelect={setDur}
        />
      </div>

      <div className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-ink-3">
        {packs.length} dari {PACKS.length} paket
      </div>

      {packs.length === 0 ? (
        <div className="mt-6 border border-dashed border-line-2 px-6 py-16 text-center">
          <h2 className="text-[18px]">Belum ada paket yang cocok</h2>
          <p className="mx-auto mt-2 max-w-[40ch] text-[14px] text-ink-2">
            Coba lepas salah satu filter untuk melihat pilihan lain.
          </p>
          <button
            onClick={() => {
              setDiff("Semua");
              setDur("Semua");
            }}
            className="mt-5 h-9 border border-line-2 bg-surface px-4 text-[13px] font-semibold text-ink hover:border-ink"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col border border-line bg-surface transition-colors hover:border-ink"
            >
              <div className="relative border-b border-line">
                <Photo
                  src={p.photo}
                  alt={p.name}
                  ratio="4 / 3"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <LevelBadge level={p.level} />
                  {p.isNew && (
                    <span className="bg-lime px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink">
                      Baru
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[18px] leading-snug">{p.name}</h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
                  {p.tagline}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.isi.map((item) => (
                    <span
                      key={item}
                      className="border border-line px-2 py-0.5 text-[11.5px] text-ink-3"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <dl className="mt-auto flex gap-6 border-t border-line pt-3 font-mono text-[12px] text-ink-3">
                  <div>
                    <dt className="sr-only">Hari ke panen</dt>
                    <dd>
                      <span className="text-ink">{p.days}</span> hari
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Tahap panduan</dt>
                    <dd>
                      <span className="text-ink">{p.stages}</span> tahap
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="font-mono text-[18px] font-medium text-ink">
                      {p.price}
                    </div>
                    <div className="text-[11.5px] text-ink-3">termasuk panduan</div>
                  </div>
                  <Link
                    href={`/paket/${p.id}`}
                    className="h-10 shrink-0 border border-ink bg-surface px-4 text-[13px] font-semibold leading-[38px] text-ink transition-colors group-hover:bg-ink group-hover:text-on-carbon"
                  >
                    Lihat paket
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Container>
  );
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  active: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
        {label}
      </span>
      {options.map((opt) => {
        const on = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`h-8 rounded-sm border px-3 text-[13px] font-medium transition-colors ${
              on
                ? "border-ink bg-lime text-ink"
                : "border-line-2 bg-surface text-ink-3 hover:border-ink hover:text-ink"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
