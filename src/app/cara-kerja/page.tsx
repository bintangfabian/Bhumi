import { ButtonLink, Container, Photo } from "@/components/ui";
import { unsplash } from "@/lib/data";

const STEPS = [
  {
    n: "01",
    title: "Pilih paketnya",
    body: "Saring katalog berdasarkan tingkat kesulitan dan lama panen. Isi tiap paket, jumlah polybag, dan estimasi hari ke panen tertulis lengkap sebelum kamu bayar.",
    photo: unsplash("1637795257839-896afee861fd", 1000),
  },
  {
    n: "02",
    title: "Paket datang lengkap",
    body: "Bibit, media tanam siap pakai, pupuk, polybag, dan alat dasar dikirim dalam satu kotak. Tidak perlu belanja terpisah ke toko tani.",
    photo: unsplash("1745063537934-e6bf484d72eb", 1000),
  },
  {
    n: "03",
    title: "Dipandu tiap tahap",
    body: "Kebun Saya membuka panduan sesuai umur tanaman, mengingatkan tugas harian seperti siram dan pupuk, dan menyimpan foto serta catatan perkembanganmu.",
    photo: unsplash("1615671524827-c1fe3973b648", 1000),
  },
  {
    n: "04",
    title: "Panen pertama",
    body: "Saat tanaman masuk masa panen, panduan menandai ciri buah siap petik. Setelah itu kamu bisa menanam ulang dari sisa bibit atau ambil paket baru.",
    photo: unsplash("1518006959466-0db0b6b4c1d0", 1000),
  },
];

const FAQ = [
  {
    q: "Butuh lahan seberapa luas?",
    a: "Tidak butuh lahan. Semua paket dirancang untuk pot atau polybag di teras, balkon, atau pagar rumah. Cukup area yang kena matahari 5–6 jam sehari.",
  },
  {
    q: "Kalau bibitnya gagal tumbuh?",
    a: "Setiap paket berisi benih lebih banyak dari jumlah polybag. Kalau daya tumbuh tetap di bawah separuh dalam 14 hari pertama, benih pengganti dikirim gratis.",
  },
  {
    q: "Panduannya berupa apa?",
    a: "Panduan digital di dashboard Kebun Saya. Terbagi jadi 4–6 tahap yang terbuka otomatis sesuai umur tanaman, lengkap dengan checklist tugas dan foto acuan.",
  },
  {
    q: "Pengiriman ke mana saja?",
    a: "Untuk sekarang gratis kirim area Jabodetabek. Luar Jabodetabek dikenakan ongkir sesuai berat paket.",
  },
];

export default function CaraKerjaPage() {
  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-[52ch]">
        <span className="kicker">Cara kerja</span>
        <h1 className="mt-3 text-[clamp(30px,4.5vw,46px)] leading-[1.05]">
          Dari paket di depan pintu sampai panen di dapur
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Bhumi menggabungkan paket bertani fisik dengan panduan digital, supaya
          kamu tidak berhenti di tengah jalan karena bingung langkah berikutnya.
        </p>
      </div>

      <ol className="mt-14 space-y-16">
        {STEPS.map((s, i) => (
          <li
            key={s.n}
            className="grid items-center gap-6 border-t-2 border-ink pt-6 lg:grid-cols-2 lg:gap-12"
          >
            <div className={i % 2 ? "lg:order-2" : ""}>
              <span className="font-mono text-[13px] font-medium text-ink-3">
                {s.n}
              </span>
              <h2 className="mt-2 text-[clamp(22px,3vw,30px)]">{s.title}</h2>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
                {s.body}
              </p>
            </div>
            <Photo
              src={s.photo}
              alt={s.title}
              ratio="16 / 10"
              className={`border border-line ${i % 2 ? "lg:order-1" : ""}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </li>
        ))}
      </ol>

      <section className="mt-20 border-t border-line pt-12">
        <h2 className="text-[clamp(22px,3vw,30px)]">Pertanyaan yang sering masuk</h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <div key={f.q} className="grid gap-2 py-5 sm:grid-cols-[0.9fr_1.1fr] sm:gap-8">
              <dt className="text-[16px] font-semibold">{f.q}</dt>
              <dd className="max-w-[62ch] text-[14px] leading-relaxed text-ink-2">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 bg-carbon p-6 text-on-carbon lg:p-8">
        <div>
          <div className="font-display text-[20px] font-bold">
            Siap mulai paket pertama?
          </div>
          <p className="mt-1 text-[14px] text-on-carbon/70">
            Cabai dan tomat, panen 70–95 hari, dipandu sejak hari pertama.
          </p>
        </div>
        <ButtonLink href="/katalog" variant="primary">
          Lihat katalog
        </ButtonLink>
      </div>
    </Container>
  );
}
