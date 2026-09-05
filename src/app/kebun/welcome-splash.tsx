import { ButtonLink, Container, Meta, Photo } from "@/components/ui";
import type { PackCard } from "@/lib/repo/packs";

const FEATURES = [
  "Tugas harian jelas, satu per satu",
  "Panduan bertahap sesuai umur tanaman",
  "Jurnal foto & lencana pencapaian",
];

/** Ditampilkan di /kebun untuk pengunjung yang belum masuk — pengganti redirect paksa ke /masuk. */
export function WelcomeSplash({ pack }: { pack: PackCard | null }) {
  return (
    <Container className="grid items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
      <div>
        <span className="kicker">Bhumi Companion</span>
        <h1 className="mt-3 text-[clamp(28px,4.5vw,42px)] leading-[1.05]">
          Panen sayur sendiri di rumah, jadi gampang
        </h1>
        <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-2">
          Panduan harian langkah demi langkah dari bibit sampai panen. Didesain tanpa ribet untuk
          apartemen, balkon, dan teras sempit.
        </p>

        <ul className="mt-6 space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-[14px] text-ink-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-xs bg-lime text-ink">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" aria-hidden>
                  <polyline points="5,13 10,18 19,6" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/masuk?tab=daftar" variant="primary">
            Mulai petualangan menanam
          </ButtonLink>
          <ButtonLink href="/masuk" variant="ghost">
            Sudah punya akun? Masuk
          </ButtonLink>
        </div>

        <p className="mt-5 text-[12.5px] text-ink-3">
          Sudah beli paket lewat katalog? <a href="/masuk" className="underline">Masuk</a>{" "}
          untuk mengaktifkan panduannya di sini.
        </p>
      </div>

      {pack && (
        <div className="relative">
          <Photo
            src={pack.photo}
            alt={pack.name}
            ratio="4 / 3"
            className="border border-line"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Meta>{pack.successRate}%+ berhasil sampai panen</Meta>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold text-ink">{pack.name}</div>
              <div className="font-mono text-[12px] text-ink-3">{pack.days} hari · {pack.effort}</div>
            </div>
            <div className="font-mono text-[16px] font-medium text-ink">{pack.price}</div>
          </div>
        </div>
      )}
    </Container>
  );
}
