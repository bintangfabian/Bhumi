/** Client-safe catalog filter/sort constants (kept out of src/lib/repo/packs.ts,
 * which pulls in the MySQL driver and can't be bundled for the browser). */
import type { Level } from "@/lib/data";

export const DIFFS: (Level | "Semua")[] = ["Semua", "Pemula", "Menengah", "Mahir"];

export const DURS: { label: string; test: (d: number) => boolean }[] = [
  { label: "Semua", test: () => true },
  { label: "Di bawah 75 hari", test: (d) => d < 75 },
  { label: "75 – 95 hari", test: (d) => d >= 75 && d <= 95 },
  { label: "Lebih dari 95 hari", test: (d) => d > 95 },
];

export const SORTS = ["Panen tercepat", "Harga terendah", "Urutan katalog"] as const;
export type SortBy = (typeof SORTS)[number];
