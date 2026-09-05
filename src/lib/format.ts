const DAY_ABBR = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
];

export function idDate(d: Date) {
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

export function idDay(d: Date) {
  return DAY_ABBR[(d.getDay() + 6) % 7];
}

export function rupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function ymd(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function mondayOf(d: Date) {
  const x = new Date(d);
  const diff = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

/** "30 menit yang lalu" / "2 jam yang lalu" / tanggal singkat kalau lebih dari 2 hari. */
export function relativeId(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit yang lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam yang lalu`;
  const day = Math.floor(hr / 24);
  if (day < 2) return "Kemarin";
  if (day < 7) return `${day} hari yang lalu`;
  return idDate(d);
}
