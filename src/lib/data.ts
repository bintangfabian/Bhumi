/**
 * Seed data for Bhumi. Stands in for the API until a backend exists.
 */

export type Level = "Pemula" | "Menengah" | "Mahir";

/**
 * Placeholder photography, curated Unsplash shots of home vegetable growing.
 * Swap for real product photos later. `unsplash()` builds a sized CDN URL;
 * `photo()` picks deterministically from the pool so a given seed is stable.
 */
export function unsplash(id: string, w = 900) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;
}

const PHOTO_POOL = [
  "1466692476868-aef1dfb1e735", // seedlings in a seed tray
  "1471194402529-8e0f5a675de6", // cherry tomatoes ripening on the vine
  "1518006959466-0db0b6b4c1d0", // red chillies on the plant
  "1591857177593-aec16c2d8f60", // young staked tomato plant in a bed
  "1592841200221-a6898f307baa", // roma tomatoes on the plant, sunny
  "1615671524827-c1fe3973b648", // hand holding a seedling over trays
  "1629282980228-46b85d221086", // tending potted plants on a patio
  "1637795257839-896afee861fd", // potted chilli plants on a shelf
  "1649255756520-923ff309df99", // seedlings in peat pots
  "1650223154381-cef156da1851", // pepper seedlings in tray cells
  "1650223154483-ccdef5d0e19d", // chilli seedlings on a windowsill
  "1686278895718-26a2331d7297", // tomatoes on the vine
  "1710663497561-b98b13c09aeb", // chilli plant in flower with small fruit
  "1745063537934-e6bf484d72eb", // watering can and pots on a balcony
  "1770982698901-defbee226738", // green chillies hanging on the plant
  "1777383504207-8aa285dd2f20", // raised planters on a patio
];

export function photo(seed: string, lock: number, w = 900) {
  let h = lock * 2654435761;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return unsplash(PHOTO_POOL[Math.abs(h) % PHOTO_POOL.length], w);
}

export type Pack = {
  id: string;
  name: string;
  tagline: string;
  level: Level;
  days: number;
  stages: number;
  price: string;
  priceValue: number;
  isNew: boolean;
  imgLabel: string;
  photo: string;
  isi: string[];
};

export const PACKS: Pack[] = [
  {
    id: "cabai-rawit",
    name: "Paket Cabai Rawit",
    tagline: "Pedas, rajin berbuah, dan paling gampang dirawat di pot.",
    level: "Pemula",
    days: 75,
    stages: 4,
    price: "Rp 89.000",
    priceValue: 89000,
    isNew: false,
    imgLabel: "foto paket cabai rawit",
    photo: unsplash("1518006959466-0db0b6b4c1d0"),
    isi: ["Bibit F1", "Pupuk organik", "5 polybag", "Sekop + sarung tangan"],
  },
  {
    id: "tomat-cherry",
    name: "Paket Tomat Cherry",
    tagline: "Manis, cepat panen, cocok untuk balkon atau teras sempit.",
    level: "Pemula",
    days: 70,
    stages: 4,
    price: "Rp 95.000",
    priceValue: 95000,
    isNew: true,
    imgLabel: "foto paket tomat cherry",
    photo: unsplash("1471194402529-8e0f5a675de6"),
    isi: ["Bibit unggul", "Pupuk NPK", "5 polybag", "Ajir + tali"],
  },
  {
    id: "duo",
    name: "Paket Duo Cabai & Tomat",
    tagline: "Dua tanaman sekaligus, satu panduan yang berjalan beriringan.",
    level: "Pemula",
    days: 80,
    stages: 5,
    price: "Rp 159.000",
    priceValue: 159000,
    isNew: true,
    imgLabel: "foto paket duo",
    photo: unsplash("1777383504207-8aa285dd2f20"),
    isi: ["2 jenis bibit", "Pupuk organik", "8 polybag", "Set alat dasar"],
  },
  {
    id: "cabai-keriting",
    name: "Paket Cabai Keriting",
    tagline: "Buah lebih besar, butuh pemangkasan dan perhatian ekstra.",
    level: "Menengah",
    days: 90,
    stages: 5,
    price: "Rp 105.000",
    priceValue: 105000,
    isNew: false,
    imgLabel: "foto paket cabai keriting",
    photo: unsplash("1637795257839-896afee861fd"),
    isi: ["Bibit hibrida", "Pupuk kandang", "6 polybag", "Gunting pangkas"],
  },
  {
    id: "tomat-beef",
    name: "Paket Tomat Beef",
    tagline: "Tomat besar untuk masak. Perlu penyangga dan pupuk rutin.",
    level: "Menengah",
    days: 95,
    stages: 5,
    price: "Rp 119.000",
    priceValue: 119000,
    isNew: false,
    imgLabel: "foto paket tomat beef",
    photo: unsplash("1592841200221-a6898f307baa"),
    isi: ["Bibit beef", "Pupuk cair", "6 polybag", "Ajir bambu"],
  },
  {
    id: "cabai-gendot",
    name: "Paket Cabai Gendot",
    tagline: "Varietas dataran tinggi. Sensitif suhu, untuk yang sudah terbiasa.",
    level: "Mahir",
    days: 110,
    stages: 6,
    price: "Rp 135.000",
    priceValue: 135000,
    isNew: false,
    imgLabel: "foto paket cabai gendot",
    photo: unsplash("1710663497561-b98b13c09aeb"),
    isi: ["Bibit lokal", "Media tanam khusus", "4 polybag", "Termometer tanah"],
  },
];

type KitItem = { name: string; desc: string; qty: string };

const KIT_LIB: Record<string, KitItem[]> = {
  "cabai-rawit": [
    { name: "Benih cabai rawit F1", desc: "Isi 25 butir, daya tumbuh di atas 90%.", qty: "1 sachet" },
    { name: "Media tanam siap pakai", desc: "Campuran tanah, kompos, dan cocopeat.", qty: "5 kg" },
    { name: "Pupuk organik + NPK", desc: "Untuk masa vegetatif dan masa berbuah.", qty: "2 pak" },
    { name: "Polybag 30 cm", desc: "Sudah berlubang drainase.", qty: "5 pcs" },
    { name: "Tray semai", desc: "24 lubang untuk tahap penyemaian.", qty: "1 pcs" },
    { name: "Sekop mini & sarung tangan", desc: "Alat dasar untuk pindah tanam.", qty: "1 set" },
  ],
  "tomat-cherry": [
    { name: "Benih tomat cherry", desc: "Isi 20 butir, varietas manis tahan pecah.", qty: "1 sachet" },
    { name: "Media tanam siap pakai", desc: "Campuran tanah, kompos, dan cocopeat.", qty: "5 kg" },
    { name: "Pupuk NPK + kalsium", desc: "Mencegah buah busuk pada ujungnya.", qty: "2 pak" },
    { name: "Polybag 35 cm", desc: "Ukuran lebih besar karena akar tomat dalam.", qty: "5 pcs" },
    { name: "Ajir bambu + tali", desc: "Penyangga batang saat mulai berbuah.", qty: "5 set" },
    { name: "Sekop mini & sarung tangan", desc: "Alat dasar untuk pindah tanam.", qty: "1 set" },
  ],
};

type GuideStep = {
  no: number;
  range: string;
  title: string;
  desc: string;
  img: string;
  photo: string;
  tasks: number;
};

const GUIDE_LIB: Record<"cabai" | "tomat", GuideStep[]> = {
  cabai: [
    { no: 1, range: "Hari 1 – 14", title: "Semai benih", desc: "Rendam benih, tanam di tray semai, jaga kelembapan sampai muncul dua daun sejati.", img: "foto: tray semai berisi bibit", photo: unsplash("1466692476868-aef1dfb1e735"), tasks: 4 },
    { no: 2, range: "Hari 15 – 28", title: "Pindah tanam", desc: "Pindahkan bibit terkuat ke polybag pada sore hari, lalu siram sampai lembap merata.", img: "foto: bibit dipindah ke polybag", photo: unsplash("1650223154381-cef156da1851"), tasks: 3 },
    { no: 3, range: "Hari 29 – 65", title: "Perawatan & pemupukan", desc: "Siram rutin, pangkas tunas air, pupuk tiap dua minggu, dan cek hama pada balik daun.", img: "foto: tanaman cabai berbunga", photo: unsplash("1710663497561-b98b13c09aeb"), tasks: 6 },
    { no: 4, range: "Hari 66 – 75", title: "Panen", desc: "Petik saat warna merata dan tangkai mudah lepas. Panen berulang tiap 3–5 hari.", img: "foto: cabai merah siap panen", photo: unsplash("1518006959466-0db0b6b4c1d0"), tasks: 3 },
  ],
  tomat: [
    { no: 1, range: "Hari 1 – 12", title: "Semai benih", desc: "Semai di tray, tempatkan di area teduh terang, semprot air dua kali sehari.", img: "foto: benih tomat baru berkecambah", photo: unsplash("1649255756520-923ff309df99"), tasks: 4 },
    { no: 2, range: "Hari 13 – 26", title: "Pindah tanam", desc: "Pindahkan ke polybag besar dan tancapkan ajir sejak awal agar akar tidak terganggu.", img: "foto: bibit tomat dengan ajir", photo: unsplash("1591857177593-aec16c2d8f60"), tasks: 4 },
    { no: 3, range: "Hari 27 – 60", title: "Perawatan & pengikatan", desc: "Ikat batang ke ajir, buang tunas samping, dan beri pupuk kalsium saat mulai berbunga.", img: "foto: tomat hijau di tangkai", photo: unsplash("1686278895718-26a2331d7297"), tasks: 6 },
    { no: 4, range: "Hari 61 – 70", title: "Panen", desc: "Petik saat buah kemerahan penuh. Panen bertahap agar tangkai lain ikut matang.", img: "foto: tomat cherry matang", photo: unsplash("1592841200221-a6898f307baa"), tasks: 3 },
  ],
};

export type PackDetail = Pack & {
  harvestRange: string;
  effort: string;
  sun: string;
  thumbs: { label: string; photo: string }[];
  kit: KitItem[];
  guide: GuideStep[];
};

export function buildDetail(p: Pack): PackDetail {
  const isTomat = p.id.includes("tomat");
  const kit = KIT_LIB[p.id] ?? KIT_LIB[isTomat ? "tomat-cherry" : "cabai-rawit"];
  const guide = GUIDE_LIB[isTomat ? "tomat" : "cabai"];
  return {
    ...p,
    harvestRange: `${p.days - 8}–${p.days + 7} hari`,
    effort: "10 mnt/hari",
    sun: "5–6 jam",
    thumbs: [
      { label: "foto: isi paket lengkap", photo: photo("gardening,kit,tools", p.days) },
      { label: "foto: kartu panduan", photo: photo("notebook,plant,guide", p.days + 1) },
      { label: "foto: hasil panen", photo: photo(isTomat ? "tomato,basket" : "chili,basket", p.days + 2) },
    ],
    kit,
    guide,
  };
}

export function getPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

/* ---------- Kebun Saya (dashboard) ---------- */

export type Plant = {
  id: string;
  name: string;
  day: number;
  total: number;
  stageNo: number;
  stageName: string;
  eta: string;
  labels: string[];
  active: number;
  todoLine: string;
  stateLabel: string;
  state: "ok" | "attention";
};

export const PLANTS: Plant[] = [
  { id: "p1", name: "Cabai Rawit", day: 34, total: 75, stageNo: 3, stageName: "Perawatan", eta: "12 Okt", labels: ["Semai", "Pindah", "Rawat", "Panen"], active: 2, todoLine: "2 tugas hari ini", stateLabel: "Sehat", state: "ok" },
  { id: "p2", name: "Tomat Cherry", day: 12, total: 70, stageNo: 1, stageName: "Semai", eta: "30 Okt", labels: ["Semai", "Pindah", "Rawat", "Panen"], active: 0, todoLine: "1 tugas hari ini", stateLabel: "Perlu dicek", state: "attention" },
];

export type Task = {
  id: string;
  title: string;
  plant: string;
  when: string;
  done: boolean;
};

export const TASKS: Task[] = [
  { id: "t1", title: "Siram cabai rawit sampai media lembap", plant: "Cabai Rawit", when: "Pagi", done: true },
  { id: "t2", title: "Cek balik daun dari kutu daun", plant: "Cabai Rawit", when: "Pagi", done: false },
  { id: "t3", title: "Semprot halus tray semai tomat", plant: "Tomat Cherry", when: "Sore", done: false },
  { id: "t4", title: "Putar posisi tray agar bibit tidak miring", plant: "Tomat Cherry", when: "Sore", done: false },
];

export const WEEK_REMINDERS = [
  { day: "Kam", text: "Pemupukan kedua cabai rawit. Pupuk NPK 1 sendok per polybag." },
  { day: "Sab", text: "Tomat cherry masuk tahap pindah tanam. Siapkan polybag 35 cm." },
  { day: "Min", text: "Foto perkembangan mingguan untuk jurnal kebun." },
];

export const GARDEN_SUMMARY = [
  { value: "2", label: "tanaman aktif" },
  { value: "18", label: "hari beruntun" },
  { value: "31", label: "foto jurnal" },
];

/* ---------- Panduan (planting guide) ---------- */

export type GuideStageStatus = "selesai" | "aktif" | "terkunci";

export type GuideStage = {
  no: number;
  title: string;
  range: string;
  status: GuideStageStatus;
  intro: string;
  body: { h: string; p: string; img: string }[];
  checklist: string[];
  done: number[];
};

export type Panduan = {
  plant: string;
  pack: string;
  day: number;
  total: number;
  stages: GuideStage[];
};

export const PANDUAN: Panduan = {
  plant: "Cabai Rawit",
  pack: "Paket Cabai Rawit",
  day: 34,
  total: 75,
  stages: [
    {
      no: 1,
      title: "Semai benih",
      range: "Hari 1 – 14",
      status: "selesai",
      intro:
        "Tahap awal untuk memunculkan kecambah sebelum bibit cukup kuat dipindah ke polybag.",
      body: [
        { h: "Rendam benih 6 jam", p: "Gunakan air hangat suam. Buang benih yang mengapung karena biasanya kosong.", img: "foto: benih direndam di mangkuk" },
        { h: "Tanam di tray semai", p: "Isi tray dengan media, buat lubang 0,5 cm, masukkan satu benih per lubang, lalu tutup tipis.", img: "foto: tray semai 24 lubang" },
      ],
      checklist: ["Rendam benih 6 jam", "Isi tray dengan media tanam", "Tanam 1 benih per lubang", "Letakkan di tempat teduh terang"],
      done: [0, 1, 2, 3],
    },
    {
      no: 2,
      title: "Pindah tanam",
      range: "Hari 15 – 28",
      status: "selesai",
      intro: "Bibit dipindahkan ke polybag saat sudah punya 4 daun sejati.",
      body: [
        { h: "Pilih bibit terkuat", p: "Ambil bibit dengan batang tegak dan daun hijau merata. Sisakan satu bibit per polybag.", img: "foto: bibit siap pindah" },
        { h: "Pindah pada sore hari", p: "Suhu yang lebih rendah mengurangi stres pindah tanam. Siram sampai media lembap merata.", img: "foto: bibit dipindah ke polybag" },
      ],
      checklist: ["Siapkan 5 polybag berisi media", "Pindahkan bibit sore hari", "Siram sampai lembap", "Beri naungan 2 hari pertama"],
      done: [0, 1, 2, 3],
    },
    {
      no: 3,
      title: "Perawatan & pemupukan",
      range: "Hari 29 – 65",
      status: "aktif",
      intro:
        "Tahap terpanjang. Fokusnya menjaga kelembapan, memangkas tunas air, dan memupuk rutin supaya tanaman siap berbunga.",
      body: [
        { h: "Siram pagi atau sore", p: "Cek media dengan menekan permukaan tanah. Siram bila terasa mulai kering sampai 2 cm ke dalam. Hindari menyiram daun saat matahari terik.", img: "foto: menyiram polybag cabai" },
        { h: "Pangkas tunas air", p: "Buang tunas yang tumbuh di ketiak daun bawah cabang utama. Tunas air menyerap nutrisi tanpa menghasilkan buah.", img: "foto: memangkas tunas air" },
        { h: "Pupuk tiap dua minggu", p: "Larutkan satu sendok NPK dalam 2 liter air, siramkan 200 ml per polybag di sekeliling batang, bukan tepat di pangkalnya.", img: "foto: melarutkan pupuk NPK" },
        { h: "Periksa hama tiap 3 hari", p: "Balik daun dan cari kutu daun atau bercak putih. Bila ada, semprot larutan sabun cair encer pada pagi hari.", img: "foto: balik daun cek hama" },
      ],
      checklist: ["Siram sampai media lembap", "Cek balik daun dari kutu daun", "Pangkas tunas air bawah", "Pemupukan kedua (Kamis)", "Foto perkembangan mingguan"],
      done: [0],
    },
    {
      no: 4,
      title: "Panen",
      range: "Hari 66 – 75",
      status: "terkunci",
      intro: "Panen bertahap tiap 3–5 hari agar tanaman terus berbuah.",
      body: [
        { h: "Petik saat warna merata", p: "Tangkai akan mudah lepas saat buah matang. Gunakan gunting agar cabang tidak ikut tertarik.", img: "foto: cabai merah siap panen" },
      ],
      checklist: ["Siapkan wadah panen", "Petik buah yang sudah merah merata", "Pupuk lanjutan setelah panen pertama"],
      done: [],
    },
  ],
};

export const JOURNAL = [
  { date: "31 Agt", text: "Dua polybag mulai berbunga. Daun yang menguning sudah dibuang.", photo: true },
  { date: "27 Agt", text: "Pemupukan pertama. Tinggi tanaman rata-rata 24 cm.", photo: false },
  { date: "22 Agt", text: "Ada kutu daun di polybag nomor 3, disemprot larutan sabun.", photo: true },
];

export const PROGRESS_PHOTOS = ["31 Agt", "24 Agt", "17 Agt"];

/* ---------- Admin ---------- */

export type AdminStage = {
  id: string;
  title: string;
  days: string;
  media: string;
  instruction: string;
  checklist: string[];
};

export type AdminPack = {
  id: string;
  name: string;
  price: string;
  level: Level;
  days: string;
  status: "Terbit" | "Draf";
  sold: number;
  stages: AdminStage[];
};

export const ADMIN_PACKS: AdminPack[] = [
  {
    id: "a1",
    name: "Paket Cabai Rawit",
    price: "89000",
    level: "Pemula",
    days: "75",
    status: "Terbit",
    sold: 128,
    stages: [
      { id: "s1", title: "Semai benih", days: "14", media: "semai-tray.jpg", instruction: "Rendam benih 6 jam dengan air hangat suam, buang benih yang mengapung. Tanam satu benih per lubang tray sedalam 0,5 cm.", checklist: ["Rendam benih 6 jam", "Isi tray dengan media tanam", "Tanam 1 benih per lubang"] },
      { id: "s2", title: "Pindah tanam", days: "14", media: "pindah-polybag.jpg", instruction: "Pilih bibit dengan batang tegak dan 4 daun sejati. Pindahkan sore hari ke polybag 30 cm, lalu siram sampai lembap merata.", checklist: ["Siapkan 5 polybag berisi media", "Pindahkan bibit sore hari", "Beri naungan 2 hari pertama"] },
      { id: "s3", title: "Perawatan & pemupukan", days: "37", media: "perawatan.jpg", instruction: "Siram bila media mulai kering, pangkas tunas air di ketiak daun bawah, dan pupuk NPK tiap dua minggu.", checklist: ["Siram sampai media lembap", "Cek balik daun dari kutu daun", "Pangkas tunas air bawah", "Pemupukan tiap 2 minggu"] },
      { id: "s4", title: "Panen", days: "10", media: "panen-cabai.jpg", instruction: "Petik saat warna merata dengan gunting agar cabang tidak tertarik. Panen berulang tiap 3–5 hari.", checklist: ["Siapkan wadah panen", "Petik buah merah merata"] },
    ],
  },
  {
    id: "a2",
    name: "Paket Tomat Cherry",
    price: "95000",
    level: "Pemula",
    days: "70",
    status: "Terbit",
    sold: 94,
    stages: [
      { id: "s1", title: "Semai benih", days: "12", media: "semai-tomat.jpg", instruction: "Semai di tray, letakkan di area teduh terang, semprot halus dua kali sehari.", checklist: ["Semai benih di tray", "Semprot pagi dan sore"] },
      { id: "s2", title: "Pindah tanam", days: "14", media: "ajir-tomat.jpg", instruction: "Pindahkan ke polybag 35 cm dan pasang ajir sejak awal agar akar tidak terganggu.", checklist: ["Pasang ajir bambu", "Pindah bibit sore hari"] },
      { id: "s3", title: "Perawatan & pengikatan", days: "34", media: "ikat-batang.jpg", instruction: "Ikat batang ke ajir setiap 20 cm, buang tunas samping, beri pupuk kalsium saat berbunga.", checklist: ["Ikat batang ke ajir", "Buang tunas samping", "Pupuk kalsium saat berbunga"] },
      { id: "s4", title: "Panen", days: "10", media: "panen-tomat.jpg", instruction: "Petik saat buah kemerahan penuh, bertahap agar tangkai lain ikut matang.", checklist: ["Petik buah merah penuh"] },
    ],
  },
  { id: "a3", name: "Paket Cabai Gendot", price: "135000", level: "Mahir", days: "110", status: "Draf", sold: 0, stages: [] },
];

/* ---------- Catalog filters ---------- */

export const DIFFS: (Level | "Semua")[] = ["Semua", "Pemula", "Menengah", "Mahir"];

export const DURS: { label: string; test: (d: number) => boolean }[] = [
  { label: "Semua", test: () => true },
  { label: "Di bawah 75 hari", test: (d) => d < 75 },
  { label: "75 – 95 hari", test: (d) => d >= 75 && d <= 95 },
  { label: "Lebih dari 95 hari", test: (d) => d > 95 },
];

export const SORTS = ["Panen tercepat", "Harga terendah", "Urutan katalog"] as const;
export type SortBy = (typeof SORTS)[number];
