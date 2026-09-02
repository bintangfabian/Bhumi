import Link from "next/link";
import { Container } from "@/components/ui";

const COLS = [
  {
    head: "Belanja",
    links: [
      { label: "Katalog paket", href: "/katalog" },
      { label: "Cara kerja", href: "/cara-kerja" },
      { label: "Keranjang", href: "/keranjang" },
    ],
  },
  {
    head: "Akun",
    links: [
      { label: "Masuk", href: "/masuk" },
      { label: "Kebun Saya", href: "/kebun" },
      { label: "Panel Admin", href: "/admin" },
    ],
  },
  {
    head: "Bantuan",
    links: [
      { label: "Pengiriman", href: "#" },
      { label: "Kontak", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-carbon text-on-carbon">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="font-display text-[20px] font-extrabold tracking-[-0.03em]">
            Bhumi
          </div>
          <p className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-on-carbon/70">
            Paket bertani lengkap dengan panduan digital, dari semai sampai panen
            pertama.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.head}>
            <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-on-carbon/50">
              {col.head}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-on-carbon/80 transition-colors hover:text-lime"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-5 text-[12px] text-on-carbon/50">
          <span>© {new Date().getFullYear()} Bhumi</span>
          <span className="font-mono uppercase tracking-[0.1em]">
            Dikirim area Jabodetabek
          </span>
        </Container>
      </div>
    </footer>
  );
}
