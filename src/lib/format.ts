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
