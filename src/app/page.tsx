"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DIFFS, DURS, PACKS, SORTS, type Level, type SortBy } from "@/lib/data";
import { ButtonLink, Container, Figure, LevelBadge } from "@/components/ui";

const STEPS = [
  {
    n: "01",
    title: "Pilih paketnya",
    body: "Saring berdasarkan tingkat kesulitan dan lama panen. Isi tiap paket tertulis lengkap sebelum kamu bayar.",
  },
  {
    n: "02",
    title: "Paket datang lengkap",
    body: "Bibit, media tanam, pupuk, polybag, dan alat dasar dikirim dalam satu kotak siap pakai.",
  },
  {
    n: "03",
    title: "Dipandu tiap tahap",
    body: "Kebun Saya membuka panduan sesuai umur tanaman, mengingatkan tugas harian, dan menyimpan catatanmu.",
  },
];

export default function CatalogPage() {
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
  }, [diff, dur, sortBy]);

  return (
    <>
      {/* Hero */}
      <Container className="grid items-end gap-10 pb-14 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-20">
        <div>
          <h1 className="text-[clamp(34px,5.5vw,52px)] leading-[1.02]">
            Panen pertama,
            <br />
            tanpa nebak-nebak.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-ink-2">
            Bibit, media tanam, dan alat dikirim lengkap ke rumah. Panduan
            digital menemani kamu dari semai sampai panen, satu tahap sekali,
            lewat dashboard Kebun Saya.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#katalog" variant="primary">
              Lihat katalog
            </ButtonLink>
            <ButtonLink href="#cara" variant="ghost">
              Cara kerjanya
            </ButtonLink>
          </div>
          <p className="mt-8 font-mono text-[13px] uppercase tracking-[0.08em] text-ink-3">
            6 paket &nbsp;·&nbsp; 4 tahap panduan &nbsp;·&nbsp; 70+ hari didampingi
          </p>
        </div>

        <Figure
          label="foto: tangan memegang polybag cabai"
          ratio="4 / 3"
          className="w-full border border-line"
        />
      </Container>

      {/* How it works */}
      <section id="cara" className="border-y border-line bg-surface">
        <Container className="py-16 lg:py-20">
          <div className="max-w-[46ch]">
            <span className="kicker">Cara kerja</span>
            <h2 className="mt-3 text-[clamp(24px,3.5vw,34px)]">
              Tiga langkah sampai panen
            </h2>
            <p className="mt-3 text-ink-2">
              Tidak perlu pengalaman. Panduannya mengurai satu tahap pada satu
              waktu.
            </p>
          </div>

          <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t-2 border-ink pt-4">
                <span className="font-mono text-[13px] font-medium text-ink-3">
                  {s.n}
                </span>
                <h3 className="mt-3 text-[19px]">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Catalog */}
      <Container id="katalog" className="py-16 lg:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="max-w-[44ch]">
            <span className="kicker">Katalog</span>
            <h2 className="mt-3 text-[clamp(24px,3.5vw,34px)]">Paket bertani</h2>
            <p className="mt-3 text-ink-2">
              Mulai dari cabai dan tomat, tanaman paling ramah untuk pemula.
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

        {/* Filters */}
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
            <h3 className="text-[18px]">Belum ada paket yang cocok</h3>
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
          <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col bg-surface transition-colors hover:bg-page"
              >
                <div className="relative border-b border-line">
                  <Figure label={p.imgLabel} ratio="4 / 3" className="w-full" />
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
                  <h3 className="text-[18px] leading-snug">{p.name}</h3>
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
                  <dl className="mt-4 flex gap-6 border-t border-line pt-3 font-mono text-[12px] text-ink-3">
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
                  <div className="mt-5 flex items-end justify-between gap-3 pt-1">
                    <div>
                      <div className="font-mono text-[18px] font-medium text-ink">
                        {p.price}
                      </div>
                      <div className="text-[11.5px] text-ink-3">
                        termasuk panduan
                      </div>
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
    </>
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
