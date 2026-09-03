"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { HarvestCard } from "@/components/gamification";
import type { HarvestCardData } from "@/lib/repo/garden";

type Ratio = "story" | "feed";

const RATIOS: { id: Ratio; label: string; size: string }[] = [
  { id: "story", label: "Story", size: "1080 × 1920" },
  { id: "feed", label: "Feed", size: "1080 × 1080" },
];

export function PanenClient({ harvest }: { harvest: HarvestCardData }) {
  const [ratio, setRatio] = useState<Ratio>("story");
  const [shared, setShared] = useState<"idle" | "done" | "copied">("idle");

  const shareText = `Panen pertama ${harvest.plant} di hari ke-${harvest.day}. Streak ${harvest.streak} hari, ${harvest.badges} lencana. Ditanam di rumah bersama Bhumi.`;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Panen pertama", text: shareText });
        setShared("done");
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShared("copied");
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <Container className="py-10 lg:py-14">
      <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        <Link href="/kebun" className="hover:text-ink">
          Kebun Saya
        </Link>
        <span>/</span>
        <Link href="/kebun/lencana" className="hover:text-ink">
          Lencana
        </Link>
        <span>/</span>
        <span className="text-ink">Kartu panen</span>
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_minmax(300px,380px)] lg:gap-16">
        <div>
          <span className="kicker">Panen pertama</span>
          <h1 className="mt-3 text-[clamp(26px,4vw,38px)]">Kartu Panen Pertama</h1>
          <p className="mt-4 max-w-[520px] text-[15.5px] leading-relaxed text-ink-2">
            Kartu ini terbit otomatis saat lencana Panen Pertama diraih. Dua rasio: story untuk
            dibagikan sebagai cerita, feed untuk unggahan biasa. Latar charcoal, aksen lime, logo
            Bhumi di sudut.
          </p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr]">
              <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Isi kartu
              </dt>
              <dd className="space-y-1 text-[15px] text-ink-2">
                <p>Foto tanaman pengguna</p>
                <p>Nama tanaman dan hari panen</p>
                <p>Streak terpanjang dan jumlah lencana</p>
              </dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr]">
              <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                Nada
              </dt>
              <dd className="text-[15px] text-ink-2">Bangga, tetap elegan. Tanpa peringkat.</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex rounded-sm border border-line-2 bg-surface p-1" role="tablist">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={ratio === r.id}
                  onClick={() => setRatio(r.id)}
                  className={`h-9 rounded-xs px-3.5 text-[13px] font-semibold transition-colors ${
                    ratio === r.id ? "bg-ink text-on-carbon" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {r.label}
                  <span className="ml-2 font-mono text-[11px] font-normal opacity-70">{r.size}</span>
                </button>
              ))}
            </div>
            <Button onClick={share}>
              {shared === "copied" ? "Teks tersalin" : shared === "done" ? "Dibagikan" : "Bagikan"}
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[340px] lg:max-w-none" style={{ containerType: "inline-size" }}>
          <HarvestCard
            plant={harvest.plant}
            day={harvest.day}
            streak={harvest.streak}
            badges={harvest.badges}
            photoUrl={harvest.photo}
            ratio={ratio}
            className="rounded-lg"
          />
        </div>
      </div>
    </Container>
  );
}
