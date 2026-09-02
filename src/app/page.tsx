import Link from "next/link";
import { ButtonLink, Container, Photo } from "@/components/ui";
import { unsplash } from "@/lib/data";

const SYSTEM = [
  {
    k: "Panduan bertahap",
    d: "Materi terbagi jadi 4–6 tahap yang terbuka otomatis sesuai umur tanaman. Kamu tidak dibanjiri semua instruksi sekaligus.",
  },
  {
    k: "Checklist & pengingat harian",
    d: "Tugas seperti siram, pupuk, dan cek hama muncul di dashboard pada harinya, lengkap dengan hitungan yang sudah selesai.",
  },
  {
    k: "Jurnal foto perkembangan",
    d: "Unggah satu foto per minggu. Bhumi menyusunnya jadi linimasa supaya perubahan tanaman terlihat jelas.",
  },
  {
    k: "Pendamping saat mentok",
    d: "Kalau ada yang tidak sesuai panduan, kirim pertanyaan langsung dari halaman tahap yang sedang kamu kerjakan.",
  },
];

const STATS = [
  { v: "6", l: "paket siap tanam" },
  { v: "4–6", l: "tahap panduan per tanaman" },
  { v: "70+", l: "hari didampingi sampai panen" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Container className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <h1 className="text-[clamp(34px,5.5vw,54px)] leading-[1.01]">
            Bertani di rumah,
            <br />
            tanpa berhenti di tengah.
          </h1>
          <p className="mt-6 max-w-[50ch] text-[17px] leading-relaxed text-ink-2">
            Bhumi mengirim paket bertani yang lengkap, lalu mendampingimu lewat
            panduan digital sampai panen pertama. Dibuat untuk pemula dan rumah
            tanpa lahan luas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/katalog" variant="primary">
              Lihat katalog
            </ButtonLink>
            <ButtonLink href="/cara-kerja" variant="ghost">
              Cara kerja
            </ButtonLink>
          </div>
        </div>

        <Photo
          src={unsplash("1629282980228-46b85d221086", 1200)}
          alt="Merawat tanaman dalam pot di teras rumah"
          ratio="4 / 3"
          className="border border-line"
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
        />
      </Container>

      {/* The problem it solves */}
      <section className="border-y border-line bg-surface">
        <Container className="py-16 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <h2 className="text-[clamp(24px,3.5vw,36px)] leading-tight">
              Kebanyakan orang berhenti di minggu ketiga.
            </h2>
            <div className="max-w-[60ch] space-y-4 text-[16px] leading-relaxed text-ink-2">
              <p>
                Beli bibit, tanam, lalu bingung. Kapan pindah polybag, seberapa
                sering pupuk, kenapa daun menguning. Panduan yang ada biasanya
                umum dan tidak menyesuaikan kondisi tanamanmu.
              </p>
              <p>
                Bhumi menutup jarak itu. Paketnya sudah pas takarannya, dan
                dashboard Kebun Saya memberi tahu apa yang perlu dilakukan hari
                ini, bukan sebulan lagi.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* System / how it accompanies you */}
      <Container className="py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="kicker">Kebun Saya</span>
            <h2 className="mt-3 text-[clamp(24px,3.5vw,34px)]">
              Dashboard yang mendampingi tiap hari
            </h2>
            <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
              Setiap paket yang kamu beli otomatis masuk ke Kebun Saya. Dari
              sana kamu menjalankan panduannya, satu tahap sekali.
            </p>
            <Photo
              src={unsplash("1615671524827-c1fe3973b648", 1000)}
              alt="Memindahkan bibit dari tray semai"
              ratio="16 / 11"
              className="mt-6 border border-line"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <ol className="divide-y divide-line border-y border-line">
            {SYSTEM.map((f, i) => (
              <li key={f.k} className="flex gap-5 py-6">
                <span className="font-mono text-[13px] text-ink-3">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-[17px]">{f.k}</h3>
                  <p className="mt-1.5 max-w-[52ch] text-[14px] leading-relaxed text-ink-2">
                    {f.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* Stat band */}
      <section className="border-y border-line bg-surface">
        <Container className="py-12">
          <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.l} className="bg-surface p-6">
                <dd className="font-display text-[32px] font-bold leading-none">
                  {s.v}
                </dd>
                <dt className="mt-2 text-[13px] text-ink-3">{s.l}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* CTA */}
      <Container className="py-16 lg:py-20">
        <div className="flex flex-col gap-6 bg-carbon p-8 text-on-carbon sm:flex-row sm:items-center sm:justify-between lg:p-12">
          <div>
            <h2 className="text-[clamp(22px,3vw,30px)] text-on-carbon">
              Mulai dari satu tanaman
            </h2>
            <p className="mt-2 max-w-[44ch] text-[14px] leading-relaxed text-on-carbon/70">
              Pilih cabai atau tomat, paket datang lengkap, panduannya jalan
              sejak hari pertama.
            </p>
          </div>
          <div className="flex gap-3">
            <ButtonLink href="/katalog" variant="primary">
              Lihat katalog
            </ButtonLink>
            <Link
              href="/cara-kerja"
              className="inline-flex h-11 items-center border border-white/25 px-5 text-[14px] font-semibold text-on-carbon transition-colors hover:border-lime hover:text-lime"
            >
              Cara kerja
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
