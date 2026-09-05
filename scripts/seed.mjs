/**
 * Membuat database `bhumi_id` di MySQL MAMP, menjalankan db/schema.sql,
 * lalu mengisi data dummy: paket, tahap panduan, akun, tanaman, dan
 * status gamifikasi yang berbeda-beda per customer.
 *
 * Jalankan:  npm run db:setup
 * (memakai .env.local lewat `node --env-file`)
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cfg = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 8889),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "root",
};
const DB_NAME = process.env.DB_NAME ?? "bhumi_id";

/* ---------- helpers ---------- */

const pad = (n) => String(n).padStart(2, "0");
function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toDateTimeStr(d) {
  return `${toDateStr(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
const today = new Date();
today.setHours(0, 0, 0, 0);
/** Tanggal N hari yang lalu (N negatif = hari ke depan) sebagai 'YYYY-MM-DD'. */
function daysAgo(n) {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}
/** Waktu N jam yang lalu sebagai 'YYYY-MM-DD HH:MM:SS'. */
function hoursAgo(n) {
  return toDateTimeStr(new Date(Date.now() - n * 3600 * 1000));
}
const unsplash = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

const PHOTOS = {
  tray: unsplash("1466692476868-aef1dfb1e735"),
  cherry: unsplash("1471194402529-8e0f5a675de6"),
  chiliRed: unsplash("1518006959466-0db0b6b4c1d0"),
  tomatStaked: unsplash("1591857177593-aec16c2d8f60"),
  romaSunny: unsplash("1592841200221-a6898f307baa"),
  handSeedling: unsplash("1615671524827-c1fe3973b648"),
  patio: unsplash("1629282980228-46b85d221086"),
  chiliShelf: unsplash("1637795257839-896afee861fd"),
  peatPots: unsplash("1649255756520-923ff309df99"),
  pepperTray: unsplash("1650223154381-cef156da1851"),
  chiliWindow: unsplash("1650223154483-ccdef5d0e19d"),
  vineTomat: unsplash("1686278895718-26a2331d7297"),
  chiliFlower: unsplash("1710663497561-b98b13c09aeb"),
  wateringCan: unsplash("1745063537934-e6bf484d72eb"),
  greenChili: unsplash("1770982698901-defbee226738"),
  planters: unsplash("1777383504207-8aa285dd2f20"),
};

/* ---------- paket ---------- */

const PACKS = [
  { id: "cabai-rawit", name: "Paket Cabai Rawit", tagline: "Pedas, rajin berbuah, dan paling gampang dirawat di pot.", level: "Pemula", days: 75, price: 89000, is_new: 0, status: "Terbit", sold: 128, photo: PHOTOS.chiliRed, kind: "cabai", stages: "4", successRate: 95, highlights: ["Bibit F1", "Pupuk organik", "5 polybag", "Sekop + sarung tangan"] },
  { id: "tomat-cherry", name: "Paket Tomat Cherry", tagline: "Manis, cepat panen, cocok untuk balkon atau teras sempit.", level: "Pemula", days: 70, price: 95000, is_new: 1, status: "Terbit", sold: 94, photo: PHOTOS.cherry, kind: "tomat", stages: "4", successRate: 88, highlights: ["Bibit unggul", "Pupuk NPK", "5 polybag", "Ajir + tali"] },
  { id: "duo", name: "Paket Duo Cabai & Tomat", tagline: "Dua tanaman sekaligus, satu panduan yang berjalan beriringan.", level: "Pemula", days: 80, price: 159000, is_new: 1, status: "Terbit", sold: 41, photo: PHOTOS.planters, kind: "duo", stages: "5", successRate: 86, highlights: ["2 jenis bibit", "Pupuk organik", "8 polybag", "Set alat dasar"] },
  { id: "cabai-keriting", name: "Paket Cabai Keriting", tagline: "Buah lebih besar, butuh pemangkasan dan perhatian ekstra.", level: "Menengah", days: 90, price: 105000, is_new: 0, status: "Terbit", sold: 57, photo: PHOTOS.chiliShelf, kind: "cabai", stages: "5", successRate: 84, highlights: ["Bibit hibrida", "Pupuk kandang", "6 polybag", "Gunting pangkas"] },
  { id: "tomat-beef", name: "Paket Tomat Beef", tagline: "Tomat besar untuk masak. Perlu penyangga dan pupuk rutin.", level: "Menengah", days: 95, price: 119000, is_new: 0, status: "Terbit", sold: 33, photo: PHOTOS.romaSunny, kind: "tomat", stages: "5", successRate: 80, highlights: ["Bibit beef", "Pupuk cair", "6 polybag", "Ajir bambu"] },
  { id: "cabai-gendot", name: "Paket Cabai Gendot", tagline: "Varietas dataran tinggi. Sensitif suhu, untuk yang sudah terbiasa.", level: "Mahir", days: 110, price: 135000, is_new: 0, status: "Terbit", sold: 12, photo: PHOTOS.chiliFlower, kind: "cabai", stages: "6", successRate: 72, highlights: ["Bibit lokal", "Media tanam khusus", "4 polybag", "Termometer tanah"] },
  { id: "selada-hidroponik", name: "Paket Selada Hidroponik", tagline: "Masih disiapkan. Selada keriting di sistem wick sederhana.", level: "Pemula", days: 45, price: 79000, is_new: 0, status: "Draf", sold: 0, photo: PHOTOS.handSeedling, kind: "selada", stages: "0", successRate: 90, highlights: ["Benih selada", "Netpot + rockwool", "Nutrisi AB mix"] },
];

const KIT = {
  cabai: [
    ["Benih cabai F1", "Isi 25 butir, daya tumbuh di atas 90%.", "1 sachet"],
    ["Media tanam siap pakai", "Campuran tanah, kompos, dan cocopeat.", "5 kg"],
    ["Pupuk organik + NPK", "Untuk masa vegetatif dan masa berbuah.", "2 pak"],
    ["Polybag 30 cm", "Sudah berlubang drainase.", "5 pcs"],
    ["Tray semai", "24 lubang untuk tahap penyemaian.", "1 pcs"],
    ["Sekop mini & sarung tangan", "Alat dasar untuk pindah tanam.", "1 set"],
  ],
  tomat: [
    ["Benih tomat", "Isi 20 butir, varietas manis tahan pecah.", "1 sachet"],
    ["Media tanam siap pakai", "Campuran tanah, kompos, dan cocopeat.", "5 kg"],
    ["Pupuk NPK + kalsium", "Mencegah buah busuk pada ujungnya.", "2 pak"],
    ["Polybag 35 cm", "Ukuran lebih besar karena akar tomat dalam.", "5 pcs"],
    ["Ajir bambu + tali", "Penyangga batang saat mulai berbuah.", "5 set"],
    ["Sekop mini & sarung tangan", "Alat dasar untuk pindah tanam.", "1 set"],
  ],
  duo: [
    ["Benih cabai rawit F1", "Isi 25 butir.", "1 sachet"],
    ["Benih tomat cherry", "Isi 20 butir.", "1 sachet"],
    ["Media tanam siap pakai", "Campuran tanah, kompos, dan cocopeat.", "8 kg"],
    ["Pupuk organik + NPK + kalsium", "Untuk dua jenis tanaman.", "3 pak"],
    ["Polybag 30 & 35 cm", "Empat untuk cabai, empat untuk tomat.", "8 pcs"],
    ["Ajir bambu + tali", "Penyangga batang tomat.", "4 set"],
    ["Set alat dasar", "Sekop mini, sarung tangan, tray semai.", "1 set"],
  ],
  selada: [
    ["Benih selada keriting", "Isi 30 butir.", "1 sachet"],
    ["Netpot + rockwool", "Wadah semai dan tanam.", "6 set"],
    ["Nutrisi AB mix", "Untuk 10 liter larutan.", "1 pak"],
  ],
};

/**
 * Template tahap. Kunci: jenis tahap. Tiap paket merangkai tahap dari sini
 * dengan durasi yang jumlahnya = umur panen paket.
 */
const STAGE_TPL = {
  semai: {
    title: "Semai benih", short: "Semai", badge: "benih", photo: PHOTOS.tray, media: "semai-tray.jpg",
    desc: "Rendam benih, tanam di tray semai, jaga kelembapan sampai muncul dua daun sejati.",
    intro: "Tahap awal untuk memunculkan kecambah sebelum bibit cukup kuat dipindah ke polybag.",
    instruction: "Rendam benih 6 jam dengan air hangat suam, buang benih yang mengapung. Tanam satu benih per lubang tray sedalam 0,5 cm.",
    sections: [
      ["Rendam benih 6 jam", "Gunakan air hangat suam. Buang benih yang mengapung karena biasanya kosong.", "foto: benih direndam di mangkuk", PHOTOS.peatPots],
      ["Tanam di tray semai", "Isi tray dengan media, buat lubang 0,5 cm, masukkan satu benih per lubang, lalu tutup tipis.", "foto: tray semai 24 lubang", PHOTOS.tray],
    ],
    checklist: ["Rendam benih 6 jam", "Isi tray dengan media tanam", "Tanam 1 benih per lubang", "Letakkan di tempat teduh terang"],
    daily: [
      ["Semprot tray", "Pagi"],
      ["Cek Kelembapan & Siram Ringan", "Sore", {
        intro: "Tunas hijau kecil sudah mulai bermunculan dari balik tanah. Mereka butuh air secukupnya tanpa terendam.",
        warning: "Hindari menyiram pakai gayung/kran langsung! Semburan air kencang merusak tunas rapuh.",
        dosLabel: "Lembap Pas: Dingin & remah menempel lembut",
        dosPhoto: PHOTOS.peatPots,
        dontsLabel: "Becek/Tergenang: Akar tunas mudah busuk",
        dontsPhoto: PHOTOS.tray,
        steps: [
          ["Tes Sentuh Jari", "Benamkan ujung jari telunjuk 1–2 cm ke dalam tanah pot."],
          ["Semprot Halus Berkala", "Jika tanah kering, gunakan spray misting halus sampai basah merata."],
        ],
      }],
    ],
  },
  keras: {
    title: "Pengerasan bibit", short: "Keras", badge: "daun", photo: PHOTOS.chiliWindow, media: "pengerasan.jpg",
    desc: "Bibit dikenalkan bertahap ke matahari langsung supaya tidak kaget saat pindah tanam.",
    intro: "Cabai gendot sensitif suhu. Tahap ini membuat bibit terbiasa dengan matahari dan angin sebelum dipindah.",
    instruction: "Jemur bibit 2 jam pagi hari, tambah 1 jam tiap dua hari. Siram tipis agar media tidak kering.",
    sections: [
      ["Jemur bertahap", "Mulai 2 jam pagi hari di tempat terlindung angin. Tambah durasi tiap dua hari.", "foto: tray bibit di teras", PHOTOS.chiliWindow],
    ],
    checklist: ["Jemur bibit hari pertama", "Naikkan durasi jemur", "Cek daun tidak layu"],
    daily: [["Jemur bibit 2 jam", "Pagi"], ["Siram tipis", "Sore"]],
  },
  pindah: {
    title: "Pindah tanam", short: "Pindah", badge: "polybag", photo: PHOTOS.pepperTray, media: "pindah-polybag.jpg",
    desc: "Pindahkan bibit terkuat ke polybag pada sore hari, lalu siram sampai lembap merata.",
    intro: "Bibit dipindahkan ke polybag saat sudah punya 4 daun sejati.",
    instruction: "Pilih bibit dengan batang tegak dan 4 daun sejati. Pindahkan sore hari ke polybag, lalu siram sampai lembap merata.",
    sections: [
      ["Pilih bibit terkuat", "Ambil bibit dengan batang tegak dan daun hijau merata. Sisakan satu bibit per polybag.", "foto: bibit siap pindah", PHOTOS.handSeedling],
      ["Pindah pada sore hari", "Suhu yang lebih rendah mengurangi stres pindah tanam. Siram sampai media lembap merata.", "foto: bibit dipindah ke polybag", PHOTOS.pepperTray],
    ],
    checklist: ["Siapkan polybag berisi media", "Pindahkan bibit sore hari", "Siram sampai lembap", "Beri naungan 2 hari pertama"],
    daily: [["Siram sampai lembap", "Pagi"], ["Cek bibit layu", "Sore"]],
  },
  rawatCabai: {
    title: "Perawatan & pemupukan", short: "Rawat", badge: "bunga", photo: PHOTOS.chiliFlower, media: "perawatan.jpg",
    desc: "Siram rutin, pangkas tunas air, pupuk tiap dua minggu, dan cek hama pada balik daun.",
    intro: "Tahap terpanjang. Fokusnya menjaga kelembapan, memangkas tunas air, dan memupuk rutin supaya tanaman siap berbunga.",
    instruction: "Siram bila media mulai kering, pangkas tunas air di ketiak daun bawah, dan pupuk NPK tiap dua minggu.",
    sections: [
      ["Siram pagi atau sore", "Cek media dengan menekan permukaan tanah. Siram bila terasa mulai kering sampai 2 cm ke dalam. Hindari menyiram daun saat matahari terik.", "foto: menyiram polybag cabai", PHOTOS.wateringCan],
      ["Pangkas tunas air", "Buang tunas yang tumbuh di ketiak daun bawah cabang utama. Tunas air menyerap nutrisi tanpa menghasilkan buah.", "foto: memangkas tunas air", PHOTOS.chiliShelf],
      ["Pupuk tiap dua minggu", "Larutkan satu sendok NPK dalam 2 liter air, siramkan 200 ml per polybag di sekeliling batang, bukan tepat di pangkalnya.", "foto: melarutkan pupuk NPK", PHOTOS.patio],
      ["Periksa hama tiap 3 hari", "Balik daun dan cari kutu daun atau bercak putih. Bila ada, semprot larutan sabun cair encer pada pagi hari.", "foto: balik daun cek hama", PHOTOS.greenChili],
    ],
    checklist: ["Siram sampai media lembap", "Cek balik daun dari kutu daun", "Pangkas tunas air bawah", "Pemupukan kedua", "Foto perkembangan mingguan"],
    daily: [
      ["Siram pagi", "Pagi"],
      ["Cek Hama di Balik Daun", "Pagi", {
        intro: "Kutu daun dan bercak putih paling sering muncul di balik daun bawah, tempat yang jarang kelihatan sekilas.",
        warning: "Jangan semprot pestisida kimia dulu — larutan sabun cair encer sudah cukup untuk kutu daun ringan.",
        dosLabel: "Daun Sehat: Hijau merata, tidak berlubang",
        dosPhoto: PHOTOS.chiliFlower,
        dontsLabel: "Hama Aktif: Kutu/bercak putih di balik daun",
        dontsPhoto: PHOTOS.greenChili,
        steps: [
          ["Balik Setiap Daun", "Periksa sisi bawah daun secara bergiliran, terutama daun tua di bagian bawah tanaman."],
          ["Semprot Bila Perlu", "Kalau ada kutu daun, semprot larutan sabun cair encer pada pagi hari, ulangi 2–3 hari sekali."],
        ],
      }],
      ["Pangkas tunas air", "Sore"],
    ],
  },
  rawatTomat: {
    title: "Perawatan & pengikatan", short: "Rawat", badge: "bunga", photo: PHOTOS.vineTomat, media: "ikat-batang.jpg",
    desc: "Ikat batang ke ajir, buang tunas samping, dan beri pupuk kalsium saat mulai berbunga.",
    intro: "Batang tomat tumbuh cepat. Ikat ke ajir tiap 20 cm dan buang tunas samping supaya energi ke buah.",
    instruction: "Ikat batang ke ajir setiap 20 cm, buang tunas samping, beri pupuk kalsium saat berbunga.",
    sections: [
      ["Ikat batang ke ajir", "Gunakan tali lembut, ikat longgar membentuk angka 8 agar batang tidak tercekik.", "foto: batang tomat diikat ke ajir", PHOTOS.tomatStaked],
      ["Buang tunas samping", "Tunas di ketiak daun dipetik saat masih kecil. Sisakan satu batang utama.", "foto: memetik tunas samping", PHOTOS.vineTomat],
      ["Pupuk kalsium saat berbunga", "Mencegah ujung buah busuk. Larutkan sesuai takaran, siram pagi hari.", "foto: melarutkan pupuk", PHOTOS.wateringCan],
    ],
    checklist: ["Ikat batang ke ajir", "Buang tunas samping", "Pupuk kalsium saat berbunga", "Foto perkembangan mingguan"],
    daily: [
      ["Siram pagi", "Pagi"],
      ["Cek hama di bawah daun", "Pagi"],
      ["Ikat Batang ke Ajir", "Sore", {
        intro: "Batang tomat tumbuh cepat dan mudah patah kalau dibiarkan menjuntai tanpa penyangga.",
        warning: "Jangan ikat terlalu kencang — batang masih akan menebal, ikatan ketat bisa mencekik jaringan tanaman.",
        dosLabel: "Ikatan Longgar: Angka 8, batang bisa bergerak",
        dosPhoto: PHOTOS.tomatStaked,
        dontsLabel: "Ikatan Kencang: Batang tertekan, mudah patah",
        dontsPhoto: PHOTOS.vineTomat,
        steps: [
          ["Pilih Titik Ikat", "Ikat tiap kenaikan 20 cm batang, mulai dari yang paling bawah."],
          ["Ikat Angka Delapan", "Lilit tali membentuk angka 8 antara ajir dan batang supaya longgar tapi stabil."],
        ],
      }],
    ],
  },
  bunga: {
    title: "Pembungaan & pembuahan", short: "Bunga", badge: "buah", photo: PHOTOS.chiliFlower, media: "pembungaan.jpg",
    desc: "Bunga mekar dan buah pertama terbentuk. Kurangi nitrogen, tambah kalium.",
    intro: "Bunga sudah muncul. Fokus tahap ini menjaga bunga tidak rontok dan buah pertama membesar.",
    instruction: "Ganti pupuk ke tinggi kalium, siram lebih sedikit tapi rutin, hindari memindahkan pot.",
    sections: [
      ["Jangan pindahkan pot", "Perubahan posisi membuat bunga rontok. Biarkan di tempat yang sama sampai buah terbentuk.", "foto: bunga cabai mekar", PHOTOS.chiliFlower],
      ["Pupuk tinggi kalium", "Kalium mendorong pembentukan buah. Berikan tiap 10 hari dengan takaran setengah.", "foto: buah muda", PHOTOS.greenChili],
    ],
    checklist: ["Ganti ke pupuk kalium", "Cek bunga rontok", "Hitung buah pertama"],
    daily: [["Siram pagi", "Pagi"], ["Cek bunga rontok", "Sore"]],
  },
  panenCabai: {
    title: "Panen", short: "Panen", badge: "panen-1", photo: PHOTOS.chiliRed, media: "panen-cabai.jpg",
    desc: "Petik saat warna merata dan tangkai mudah lepas. Panen berulang tiap 3–5 hari.",
    intro: "Panen bertahap tiap 3–5 hari agar tanaman terus berbuah.",
    instruction: "Petik saat warna merata dengan gunting agar cabang tidak tertarik. Panen berulang tiap 3–5 hari.",
    sections: [
      ["Petik saat warna merata", "Tangkai akan mudah lepas saat buah matang. Gunakan gunting agar cabang tidak ikut tertarik.", "foto: cabai merah siap panen", PHOTOS.chiliRed],
    ],
    checklist: ["Siapkan wadah panen", "Petik buah yang sudah merah merata", "Pupuk lanjutan setelah panen pertama"],
    daily: [["Siram pagi", "Pagi"], ["Petik buah yang matang", "Sore"]],
  },
  panenTomat: {
    title: "Panen", short: "Panen", badge: "panen-1", photo: PHOTOS.romaSunny, media: "panen-tomat.jpg",
    desc: "Petik saat buah kemerahan penuh. Panen bertahap agar tangkai lain ikut matang.",
    intro: "Petik saat buah kemerahan penuh, bertahap agar tangkai lain ikut matang.",
    instruction: "Petik saat buah kemerahan penuh, bertahap agar tangkai lain ikut matang.",
    sections: [
      ["Petik dengan tangkai", "Putar buah perlahan sampai lepas dari tangkai. Buah yang masih oranye bisa diperam di dalam rumah.", "foto: tomat cherry matang", PHOTOS.cherry],
    ],
    checklist: ["Siapkan wadah panen", "Petik buah merah penuh", "Pupuk lanjutan setelah panen pertama"],
    daily: [["Siram pagi", "Pagi"], ["Petik buah yang matang", "Sore"]],
  },
};

/** Susunan tahap per paket: [jenis tahap, durasi hari]. Jumlah = umur panen. */
const PACK_STAGES = {
  "cabai-rawit": [["semai", 14], ["pindah", 14], ["rawatCabai", 37], ["panenCabai", 10]],
  "tomat-cherry": [["semai", 12], ["pindah", 14], ["rawatTomat", 34], ["panenTomat", 10]],
  duo: [["semai", 14], ["pindah", 14], ["rawatCabai", 22], ["bunga", 18], ["panenCabai", 12]],
  "cabai-keriting": [["semai", 14], ["pindah", 14], ["rawatCabai", 30], ["bunga", 20], ["panenCabai", 12]],
  "tomat-beef": [["semai", 12], ["pindah", 14], ["rawatTomat", 33], ["bunga", 22], ["panenTomat", 14]],
  "cabai-gendot": [["semai", 16], ["keras", 10], ["pindah", 14], ["rawatCabai", 34], ["bunga", 22], ["panenCabai", 14]],
  "selada-hidroponik": [],
};

const BADGES = [
  ["benih", "Benih tertanam", "benih"],
  ["daun", "Daun sejati pertama", "daun"],
  ["polybag", "Pindah polybag", "polybag"],
  ["bunga", "Bunga pertama", "bunga"],
  ["buah", "Buah pertama", "buah"],
  ["panen-1", "Panen pertama", "panen-1"],
  ["panen-2", "Panen kedua", "panen-2"],
  ["musim", "Musim selesai", "musim"],
];

/* ---------- akun ---------- */

const CUSTOMER_PW = "bhumi123";

/**
 * Tiap customer dibuat dengan kondisi gamifikasi berbeda supaya semua state
 * (lencana, streak, kesehatan tanaman, naik tahap, kartu panen) bisa dicek.
 */
const USERS = [
  {
    email: "superadmin@bhumi.id", password: "bhumi.id123", name: "Super Admin", role: "superadmin",
    shields: 1, best: 0, badges: [], careDays: [], plants: [], orders: [], reminders: [], challenge: null,
  },
  {
    // Kondisi "standar": streak aktif 12 hari, 4 lencana (1 baru), tahap 2 tomat baru terbuka.
    email: "rani@bhumi.id", password: CUSTOMER_PW, name: "Rani", role: "customer",
    shields: 1, best: 21,
    badges: [["benih", daysAgo(17)], ["daun", daysAgo(10)], ["polybag", daysAgo(3)], ["bunga", hoursAgo(5)]],
    careDays: range(1, 12).map((n) => [daysAgo(n), "done"]),
    plants: [
      { pack: "cabai-rawit", name: "Cabai Rawit", photo: PHOTOS.chiliShelf, plantedDaysAgo: 30, health: "sehat", lastSeenStage: 3,
        checklistDone: { 1: [0, 1, 2, 3], 2: [0, 1, 2, 3], 3: [0] }, todayDone: [0],
        journal: [[daysAgo(3), "Dua polybag mulai berbunga. Daun yang menguning sudah dibuang.", PHOTOS.chiliFlower], [daysAgo(7), "Pemupukan pertama. Tinggi tanaman rata-rata 24 cm.", null], [daysAgo(12), "Ada kutu daun di polybag nomor 3, disemprot larutan sabun.", PHOTOS.greenChili]],
        photos: [[daysAgo(3), PHOTOS.chiliShelf], [daysAgo(10), PHOTOS.chiliWindow], [daysAgo(17), PHOTOS.pepperTray]] },
      { pack: "tomat-cherry", name: "Tomat Cherry", photo: PHOTOS.tomatStaked, plantedDaysAgo: 12, health: "perhatian", lastSeenStage: 1,
        checklistDone: { 1: [0, 1, 2, 3] }, todayDone: [],
        journal: [[daysAgo(5), "Kecambah muncul di 18 dari 24 lubang.", null]],
        photos: [[daysAgo(6), PHOTOS.tray]] },
    ],
    orders: [{ pack: "duo", status: "dikirim", daysAgo: 6 }],
    reminders: [[daysAgo(-1), "Pemupukan kedua cabai rawit. Pupuk NPK 1 sendok per polybag."], [daysAgo(-3), "Tomat cherry masuk tahap pindah tanam. Siapkan polybag 35 cm."], [daysAgo(-4), "Foto perkembangan mingguan untuk jurnal kebun."]],
    challenge: { text: "Unggah 2 foto perkembangan minggu ini", target: 2 },
  },
  {
    // Pengguna baru: 1 lencana (baru), streak baru mulai dari 1.
    email: "dimas@bhumi.id", password: CUSTOMER_PW, name: "Dimas", role: "customer",
    shields: 1, best: 1,
    badges: [["benih", hoursAgo(26)]],
    careDays: [[daysAgo(1), "done"]],
    plants: [
      { pack: "cabai-rawit", name: "Cabai Rawit", photo: PHOTOS.tray, plantedDaysAgo: 2, health: "sehat", lastSeenStage: 1,
        checklistDone: { 1: [0, 1, 2] }, todayDone: [],
        journal: [[daysAgo(1), "Benih sudah ditanam, tray ditaruh dekat jendela dapur.", null]],
        photos: [] },
    ],
    orders: [],
    reminders: [[daysAgo(-2), "Cek apakah kecambah sudah muncul. Jaga media tetap lembap."]],
    challenge: { text: "Unggah 2 foto perkembangan minggu ini", target: 2 },
  },
  {
    // Rekor: streak 21 hari (= rekor), 6 lencana, sudah panen pertama → kartu panen terbit.
    email: "sari@bhumi.id", password: CUSTOMER_PW, name: "Sari", role: "customer",
    shields: 1, best: 21,
    badges: [["benih", daysAgo(66)], ["daun", daysAgo(58)], ["polybag", daysAgo(52)], ["bunga", daysAgo(30)], ["buah", daysAgo(18)], ["panen-1", daysAgo(3)]],
    careDays: range(0, 20).map((n) => [daysAgo(n), "done"]),
    plants: [
      { pack: "cabai-rawit", name: "Cabai Rawit", photo: PHOTOS.chiliRed, plantedDaysAgo: 67, health: "sehat", lastSeenStage: 4, harvestedDaysAgo: 3,
        checklistDone: { 1: [0, 1, 2, 3], 2: [0, 1, 2, 3], 3: [0, 1, 2, 3, 4], 4: [0, 1] }, todayDone: "all",
        journal: [[daysAgo(3), "Panen pertama: 14 buah merah dari tiga polybag.", PHOTOS.chiliRed], [daysAgo(9), "Buah mulai memerah di polybag 1 dan 2.", null]],
        photos: [[daysAgo(3), PHOTOS.chiliRed], [daysAgo(10), PHOTOS.greenChili], [daysAgo(17), PHOTOS.chiliFlower], [daysAgo(24), PHOTOS.chiliShelf]] },
      { pack: "tomat-beef", name: "Tomat Beef", photo: PHOTOS.romaSunny, plantedDaysAgo: 39, health: "sehat", lastSeenStage: 3,
        checklistDone: { 1: [0, 1, 2, 3], 2: [0, 1, 2, 3], 3: [0, 1] }, todayDone: "all",
        journal: [[daysAgo(2), "Batang sudah diikat ke ajir ketiga. Tinggi 60 cm.", null]],
        photos: [[daysAgo(2), PHOTOS.tomatStaked]] },
    ],
    orders: [],
    reminders: [[daysAgo(-2), "Panen kedua cabai rawit. Petik buah yang sudah merah merata."], [daysAgo(-5), "Pupuk kalsium tomat beef saat bunga pertama muncul."]],
    challenge: { text: "Catat hasil panen di jurnal", target: 1 },
  },
  {
    // Pelindung terpakai: 1 hari terlewat ditutup pelindung, tanaman perlu perhatian.
    email: "budi@bhumi.id", password: CUSTOMER_PW, name: "Budi", role: "customer",
    shields: 0, best: 15,
    badges: [["benih", daysAgo(33)], ["daun", daysAgo(25)], ["polybag", daysAgo(19)]],
    careDays: range(1, 9).map((n) => [daysAgo(n), n === 3 ? "shield" : "done"]),
    plants: [
      { pack: "cabai-keriting", name: "Cabai Keriting", photo: PHOTOS.chiliShelf, plantedDaysAgo: 34, health: "perhatian", lastSeenStage: 3,
        checklistDone: { 1: [0, 1, 2, 3], 2: [0, 1, 2, 3], 3: [0, 1] }, todayDone: [0],
        journal: [[daysAgo(3), "Lupa siram kemarin, daun bawah agak layu.", null], [daysAgo(8), "Pangkas tunas air pertama.", PHOTOS.chiliShelf]],
        photos: [[daysAgo(4), PHOTOS.chiliShelf], [daysAgo(11), PHOTOS.pepperTray]] },
    ],
    orders: [],
    reminders: [[daysAgo(-1), "Pemupukan NPK cabai keriting."], [daysAgo(-3), "Foto perkembangan mingguan untuk jurnal kebun."]],
    challenge: { text: "Selesaikan semua tugas 3 hari berturut-turut", target: 3 },
  },
  {
    // Veteran: semua 8 lencana, streak putus (0), tanaman baru dalam kondisi kritis.
    email: "lina@bhumi.id", password: CUSTOMER_PW, name: "Lina", role: "customer",
    shields: 0, best: 30,
    badges: [["benih", daysAgo(120)], ["daun", daysAgo(112)], ["polybag", daysAgo(105)], ["bunga", daysAgo(80)], ["buah", daysAgo(66)], ["panen-1", daysAgo(50)], ["panen-2", daysAgo(44)], ["musim", daysAgo(20)]],
    careDays: range(4, 33).map((n) => [daysAgo(n), "done"]),
    plants: [
      { pack: "cabai-gendot", name: "Cabai Gendot", photo: PHOTOS.chiliWindow, plantedDaysAgo: 11, health: "kritis", lastSeenStage: 1,
        checklistDone: { 1: [0, 1] }, todayDone: [],
        journal: [[daysAgo(4), "Tiga hari tidak sempat cek, beberapa kecambah rebah.", null]],
        photos: [[daysAgo(9), PHOTOS.tray]] },
    ],
    orders: [{ pack: "tomat-cherry", status: "dipesan", daysAgo: 1 }],
    reminders: [[daysAgo(0), "Siram perlahan dan jauhkan tray dari matahari langsung."]],
    challenge: { text: "Unggah 2 foto perkembangan minggu ini", target: 2 },
  },
];

function range(from, to) {
  const out = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}

/* ---------- main ---------- */

async function main() {
  const admin = await mysql.createConnection({ ...cfg, multipleStatements: true });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await admin.end();

  const conn = await mysql.createConnection({ ...cfg, database: DB_NAME, multipleStatements: true });
  const schema = await readFile(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await conn.query(schema);
  console.log(`✓ Skema dibuat di ${DB_NAME} (${cfg.host}:${cfg.port})`);

  // Lencana
  for (const [i, [id, name, icon]] of BADGES.entries()) {
    await conn.query("INSERT INTO badges (id, name, icon, sort_order) VALUES (?,?,?,?)", [id, name, icon, i]);
  }

  // Paket + tahap
  const stageIds = {}; // pack_id -> [{id, no, checklistIds[]}]
  for (const [pi, p] of PACKS.entries()) {
    await conn.query(
      "INSERT INTO packs (id, name, tagline, level, days, price, is_new, status, sold, photo_url, success_rate, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [p.id, p.name, p.tagline, p.level, p.days, p.price, p.is_new, p.status, p.sold, p.photo, p.successRate, pi],
    );
    for (const [i, label] of p.highlights.entries()) {
      await conn.query("INSERT INTO pack_highlights (pack_id, label, sort_order) VALUES (?,?,?)", [p.id, label, i]);
    }
    const kit = KIT[p.kind] ?? KIT.cabai;
    for (const [i, [name, desc, qty]] of kit.entries()) {
      await conn.query("INSERT INTO pack_kit_items (pack_id, name, description, qty, sort_order) VALUES (?,?,?,?,?)", [p.id, name, desc, qty, i]);
    }
    const isTomat = p.kind === "tomat";
    const gallery = [
      ["foto: isi paket lengkap", PHOTOS.wateringCan],
      ["foto: kartu panduan", PHOTOS.handSeedling],
      ["foto: hasil panen", isTomat ? PHOTOS.cherry : PHOTOS.chiliRed],
    ];
    for (const [i, [label, url]] of gallery.entries()) {
      await conn.query("INSERT INTO pack_gallery (pack_id, label, photo_url, sort_order) VALUES (?,?,?,?)", [p.id, label, url, i]);
    }

    stageIds[p.id] = [];
    for (const [si, [kind, duration]] of PACK_STAGES[p.id].entries()) {
      const t = STAGE_TPL[kind];
      const [res] = await conn.query(
        "INSERT INTO pack_stages (pack_id, stage_no, title, short_label, duration_days, description, intro, instruction, media, photo_url, badge_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [p.id, si + 1, t.title, t.short, duration, t.desc, t.intro, t.instruction, t.media, t.photo, t.badge],
      );
      const stageId = res.insertId;
      for (const [i, [h, body, img, url]] of t.sections.entries()) {
        await conn.query("INSERT INTO stage_sections (stage_id, heading, body, img_label, photo_url, sort_order) VALUES (?,?,?,?,?,?)", [stageId, h, body, img, url, i]);
      }
      const checklistIds = [];
      for (const [i, label] of t.checklist.entries()) {
        const [r] = await conn.query("INSERT INTO stage_checklist (stage_id, label, sort_order) VALUES (?,?,?)", [stageId, label, i]);
        checklistIds.push(r.insertId);
      }
      const dailyTaskIds = [];
      for (const [i, [title, when, rich]] of t.daily.entries()) {
        const [dr] = await conn.query(
          "INSERT INTO stage_daily_tasks (stage_id, title, when_label, sort_order, intro, warning, dos_label, dos_photo_url, donts_label, donts_photo_url) VALUES (?,?,?,?,?,?,?,?,?,?)",
          [
            stageId, title, when, i,
            rich?.intro ?? null, rich?.warning ?? null,
            rich?.dosLabel ?? "", rich?.dosPhoto ?? "",
            rich?.dontsLabel ?? "", rich?.dontsPhoto ?? "",
          ],
        );
        dailyTaskIds.push(dr.insertId);
        if (rich?.steps) {
          for (const [si2, [stepTitle, stepBody]] of rich.steps.entries()) {
            await conn.query(
              "INSERT INTO stage_daily_task_steps (task_id, title, body, sort_order) VALUES (?,?,?,?)",
              [dr.insertId, stepTitle, stepBody, si2],
            );
          }
        }
      }
      stageIds[p.id].push({ id: stageId, no: si + 1, checklistIds, daily: t.daily, dailyTaskIds, duration });
    }
  }
  console.log(`✓ ${PACKS.length} paket beserta tahap panduan`);

  // Akun + data kebun
  const userIdByEmail = {};
  const plantIdByKey = {};
  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const [ur] = await conn.query(
      "INSERT INTO users (email, password_hash, name, role, shields, best_streak) VALUES (?,?,?,?,?,?)",
      [u.email, hash, u.name, u.role, u.shields, u.best],
    );
    const userId = ur.insertId;
    userIdByEmail[u.email] = userId;

    for (const [badge, at] of u.badges) {
      const earnedAt = at.length === 10 ? `${at} 08:00:00` : at;
      await conn.query("INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?,?,?)", [userId, badge, earnedAt]);
    }
    for (const [d, kind] of u.careDays) {
      await conn.query("INSERT INTO care_logs (user_id, log_date, kind) VALUES (?,?,?)", [userId, d, kind]);
    }
    for (const o of u.orders) {
      const pack = PACKS.find((p) => p.id === o.pack);
      await conn.query(
        "INSERT INTO orders (user_id, pack_id, qty, total, status, ordered_at) VALUES (?,?,?,?,?,?)",
        [userId, o.pack, 1, pack.price, o.status, `${daysAgo(o.daysAgo)} 10:00:00`],
      );
    }
    for (const [d, text] of u.reminders) {
      await conn.query("INSERT INTO reminders (user_id, remind_on, text) VALUES (?,?,?)", [userId, d, text]);
    }
    if (u.challenge) {
      await conn.query("INSERT INTO weekly_challenges (user_id, week_start, text, target) VALUES (?,?,?,?)", [userId, mondayOf(today), u.challenge.text, u.challenge.target]);
    }

    for (const pl of u.plants) {
      const [pr] = await conn.query(
        "INSERT INTO plants (user_id, pack_id, name, photo_url, planted_on, health, last_seen_stage, harvested_on) VALUES (?,?,?,?,?,?,?,?)",
        [userId, pl.pack, pl.name, pl.photo, daysAgo(pl.plantedDaysAgo), pl.health, pl.lastSeenStage, pl.harvestedDaysAgo != null ? daysAgo(pl.harvestedDaysAgo) : null],
      );
      const plantId = pr.insertId;
      plantIdByKey[`${u.email}:${pl.name}`] = plantId;
      const stages = stageIds[pl.pack];

      for (const [no, idxs] of Object.entries(pl.checklistDone)) {
        const st = stages[Number(no) - 1];
        for (const i of idxs) {
          if (st.checklistIds[i] == null) continue;
          await conn.query("INSERT INTO plant_checklist_progress (plant_id, checklist_id, done_at) VALUES (?,?,?)", [plantId, st.checklistIds[i], `${daysAgo(1)} 07:30:00`]);
        }
      }

      // Tugas hari ini dari rutinitas tahap yang sedang berjalan.
      const day = pl.plantedDaysAgo + 1;
      const current = stageForDay(stages, day);
      for (const [i, [title, when]] of current.daily.entries()) {
        const isDone = pl.todayDone === "all" || (Array.isArray(pl.todayDone) && pl.todayDone.includes(i));
        await conn.query(
          "INSERT INTO plant_tasks (plant_id, task_date, title, when_label, sort_order, done_at, source_task_id) VALUES (?,?,?,?,?,?,?)",
          [plantId, daysAgo(0), title, when, i, isDone ? hoursAgo(2) : null, current.dailyTaskIds?.[i] ?? null],
        );
      }

      for (const [d, text, url] of pl.journal) {
        await conn.query("INSERT INTO journal_entries (plant_id, entry_date, text, photo_url) VALUES (?,?,?,?)", [plantId, d, text, url]);
      }
      for (const [d, url] of pl.photos) {
        await conn.query("INSERT INTO progress_photos (plant_id, taken_on, photo_url) VALUES (?,?,?)", [plantId, d, url]);
      }
    }
  }
  console.log(`✓ ${USERS.length} akun beserta tanaman, lencana, dan streak`);

  // ---------- Learn Hub: deteksi gejala (statis, rule-based) ----------
  const CARE_ISSUES = [
    ["semua", "Daun menguning", "Overwatering atau kekurangan sinar matahari", "Kurangi frekuensi siram, pindahkan pot ke area yang kena matahari pagi 5–6 jam. Cek drainase pot tidak tersumbat.", "waspada"],
    ["semua", "Batang layu mendadak", "Kekurangan air atau terik berlebih di siang hari", "Siram segera sampai media lembap merata, pindahkan sementara ke tempat teduh sampai batang tegak kembali.", "darurat"],
    ["semua", "Bintik/serbuk putih di daun", "Embun tepung (jamur)", "Pangkas daun yang terinfeksi berat, semprot larutan baking soda encer, jaga sirkulasi udara antar pot.", "waspada"],
    ["semua", "Daun berlubang-lubang", "Ulat grayak atau kutu daun aktif", "Balik daun untuk cari telur/ulat, ambil manual, semprot larutan sabun cair encer pada sore hari.", "waspada"],
    ["cabai", "Bunga rontok sebelum jadi buah", "Pot terlalu sering dipindah atau kekurangan kalium", "Biarkan pot di posisi tetap, ganti pupuk ke kadar kalium lebih tinggi tiap 10 hari.", "info"],
    ["cabai", "Buah keriput sebelum matang", "Kekurangan air saat pembesaran buah", "Siram rutin pagi & sore selama masa pembuahan, jangan biarkan media benar-benar kering.", "waspada"],
    ["tomat", "Ujung buah busuk hitam", "Kekurangan kalsium (blossom end rot)", "Beri pupuk kalsium saat mulai berbunga, jaga penyiraman tetap konsisten (tidak kering-basah bergantian).", "waspada"],
    ["tomat", "Batang tomat rebah", "Ajir kurang kokoh atau belum diikat", "Tambahkan ajir bambu yang lebih tinggi, ikat batang tiap kenaikan 20 cm dengan simpul longgar.", "info"],
  ];
  for (const [i, [kind, symptom, cause, action, severity]] of CARE_ISSUES.entries()) {
    await conn.query(
      "INSERT INTO care_issues (plant_kind, symptom, cause, action, severity, sort_order) VALUES (?,?,?,?,?,?)",
      [kind, symptom, cause, action, severity, i],
    );
  }
  console.log(`✓ ${CARE_ISSUES.length} entri deteksi gejala (Learn Hub)`);

  // ---------- Komunitas: contoh post + like ----------
  const rani = userIdByEmail["rani@bhumi.id"];
  const dimas = userIdByEmail["dimas@bhumi.id"];
  const sari = userIdByEmail["sari@bhumi.id"];
  const budi = userIdByEmail["budi@bhumi.id"];
  const lina = userIdByEmail["lina@bhumi.id"];
  const COMMUNITY_POSTS = [
    { user: sari, plant: plantIdByKey["sari@bhumi.id:Cabai Rawit"], photo: PHOTOS.chiliRed, caption: "Panen pertama! 14 buah merah dari tiga polybag, ngga nyangka starter kit Bhumi bisa sebagus ini buat pemula.", tag: "panen", daysAgo: 3 },
    { user: rani, plant: plantIdByKey["rani@bhumi.id:Cabai Rawit"], photo: PHOTOS.chiliFlower, caption: "Bunga pertama mekar hari ini! Ngikutin pengingat harian jam 09.00 bikin tanaman jadi teratur dirawat.", tag: "umum", daysAgo: 2 },
    { user: dimas, plant: plantIdByKey["dimas@bhumi.id:Cabai Rawit"], photo: PHOTOS.tray, caption: "Baru mulai, kecambah muncul di sebagian besar lubang tray. Semoga lancar sampai panen.", tag: "bibit-tunas", daysAgo: 1 },
    { user: budi, plant: plantIdByKey["budi@bhumi.id:Cabai Keriting"], photo: PHOTOS.chiliShelf, caption: "Sempat lupa siram sehari, untung ada pelindung streak jadi ga kaget lihat progress turun.", tag: "umum", daysAgo: 4 },
    { user: lina, plant: plantIdByKey["lina@bhumi.id:Cabai Gendot"], photo: PHOTOS.chiliWindow, caption: "Sudah 8 lencana terkumpul dari musim tanam sebelumnya, sekarang coba varietas yang lebih menantang.", tag: "umum", daysAgo: 6 },
  ];
  const postIds = [];
  for (const p of COMMUNITY_POSTS) {
    const [r] = await conn.query(
      "INSERT INTO community_posts (user_id, plant_id, photo_url, caption, tag, created_at) VALUES (?,?,?,?,?,?)",
      [p.user, p.plant ?? null, p.photo, p.caption, p.tag, `${daysAgo(p.daysAgo)} ${9 + p.daysAgo}:15:00`],
    );
    postIds.push(r.insertId);
  }
  const LIKES = [
    [postIds[0], rani], [postIds[0], dimas], [postIds[0], budi],
    [postIds[1], sari], [postIds[1], lina],
    [postIds[2], rani],
    [postIds[3], sari], [postIds[3], lina],
  ];
  for (const [postId, userId] of LIKES) {
    await conn.query("INSERT IGNORE INTO community_likes (post_id, user_id) VALUES (?,?)", [postId, userId]);
  }
  console.log(`✓ ${COMMUNITY_POSTS.length} post komunitas beserta like`);

  await conn.end();

  console.log("\nAkun untuk login:");
  for (const u of USERS) console.log(`  ${u.email.padEnd(24)} ${u.password.padEnd(12)} (${u.role})`);
}

function stageForDay(stages, day) {
  let start = 1;
  for (const s of stages) {
    if (day < start + s.duration) return s;
    start += s.duration;
  }
  return stages[stages.length - 1];
}

function mondayOf(d) {
  const x = new Date(d);
  const diff = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - diff);
  return toDateStr(x);
}

main().catch((err) => {
  console.error("Seed gagal:", err.message);
  process.exit(1);
});
