import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackDetail } from "@/lib/repo/packs";
import { Container, Figure, LevelBadge, Meta, Photo } from "@/components/ui";
import { BuyBar } from "./buy-bar";

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getPackDetail(id);
  if (!d) notFound();

  const spec = [
    { k: "Estimasi panen", v: d.harvestRange },
    { k: "Waktu rawat", v: d.effort },
    { k: "Butuh sinar", v: d.sun },
  ];

  return (
    <Container className="py-10 lg:py-14">
      <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
        <Link href="/katalog" className="hover:text-ink">
          Katalog
        </Link>
        <span>/</span>
        <span className="text-ink">{d.name}</span>
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="grid gap-2 lg:sticky lg:top-24">
          <Photo
            src={d.photo}
            alt={d.name}
            ratio="4 / 3"
            className="border border-line"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="grid grid-cols-3 gap-2">
            {d.thumbs.map((t) => (
              <Photo
                key={t.label}
                src={t.photo}
                alt={t.label}
                ratio="1 / 1"
                className="border border-line"
                sizes="30vw"
              />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={d.level} prefix="Tingkat" />
            <Meta>{d.days} hari ke panen</Meta>
            <Meta>{d.stages} tahap panduan</Meta>
          </div>

          <h1 className="mt-4 text-[clamp(28px,4vw,40px)]">{d.name}</h1>
          <p className="mt-3 max-w-[54ch] text-[16px] leading-relaxed text-ink-2">
            {d.tagline}
          </p>

          <dl className="mt-8 grid grid-cols-3 border-y border-line">
            {spec.map((s, i) => (
              <div
                key={s.k}
                className={`py-4 ${i > 0 ? "border-l border-line pl-4" : ""}`}
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                  {s.k}
                </dt>
                <dd className="mt-1.5 font-display text-[17px] font-bold">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[16px]">Isi paket</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {d.kit.length} item
              </span>
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {d.kit.map((k) => (
                <li key={k.name} className="flex items-start gap-4 py-3.5">
                  <Figure ratio="1 / 1" className="mt-0.5 w-10 shrink-0" />
                  <div className="flex-1">
                    <div className="text-[14.5px] font-semibold">{k.name}</div>
                    <div className="text-[13px] leading-relaxed text-ink-2">
                      {k.desc}
                    </div>
                  </div>
                  <span className="whitespace-nowrap font-mono text-[12px] text-ink-3">
                    {k.qty}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <BuyBar
            id={d.id}
            name={d.name}
            price={d.priceValue}
            priceLabel={d.price}
          />
        </div>
      </div>

      {/* Guide preview */}
      <section className="mt-16 border-t border-line pt-12 lg:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[46ch]">
            <span className="kicker">Panduan digital</span>
            <h2 className="mt-3 text-[clamp(22px,3vw,30px)]">
              Empat tahap, terbuka sesuai umur tanaman
            </h2>
          </div>
          <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
            Termasuk harga paket
          </span>
        </div>

        <ol className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {d.guide.map((g) => (
            <li key={g.no} className="border-t-2 border-ink pt-4">
              <div className="flex items-center justify-between font-mono text-[12px] text-ink-3">
                <span>0{g.no}</span>
                <span>{g.range}</span>
              </div>
              <Photo
                src={g.photo}
                alt={g.title}
                ratio="16 / 10"
                className="mt-3 border border-line"
                sizes="(max-width: 640px) 100vw, 25vw"
              />
              <h3 className="mt-3 text-[16px]">{g.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                {g.desc}
              </p>
              <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                {g.tasks} tugas ceklis
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
