"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart";
import { Logo } from "@/components/logo";
import { ButtonLink, Container } from "@/components/ui";
import { logoutAction } from "@/app/masuk/actions";
import type { SessionUser } from "@/lib/session";

const NAV = [
  { href: "/katalog", label: "Katalog", match: (p: string) => p.startsWith("/katalog") || p.startsWith("/paket") },
  { href: "/cara-kerja", label: "Cara Kerja", match: (p: string) => p.startsWith("/cara-kerja") },
  { href: "/kebun", label: "Kebun Saya", match: (p: string) => p.startsWith("/kebun") },
];

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const { count } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/masuk")) return null;

  const nav = user?.role === "superadmin"
    ? [...NAV, { href: "/admin", label: "Admin", match: (p: string) => p.startsWith("/admin") }]
    : NAV;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page">
      <Container className="flex h-16 items-center gap-5">
        <Link href="/" aria-label="Bhumi — beranda" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="ml-5 hidden items-center gap-7 min-[880px]:flex">
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative text-[14px] font-medium transition-colors hover:text-ink ${
                  active
                    ? "text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:bg-lime"
                    : "text-ink-3"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/keranjang"
            className="flex h-9 items-center gap-2 border border-line-2 bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink"
          >
            Keranjang
            <span className="font-mono text-[12px] text-ink-3">
              {String(count).padStart(2, "0")}
            </span>
          </Link>
          {user ? (
            <form action={logoutAction} className="hidden items-center gap-2 sm:flex">
              <span className="font-mono text-[12px] text-ink-3">{user.name}</span>
              <button
                type="submit"
                className="h-9 border border-line-2 bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-ink"
              >
                Keluar
              </button>
            </form>
          ) : (
            <ButtonLink
              href="/masuk"
              variant="solid"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Masuk
            </ButtonLink>
          )}
          <button
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center border border-line-2 bg-surface text-ink min-[880px]:hidden"
          >
            <span className="text-[15px] leading-none">{open ? "×" : "≡"}</span>
          </button>
        </div>
      </Container>

      {open && (
        <nav className="border-t border-line bg-surface min-[880px]:hidden">
          <Container className="flex flex-col py-1">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3 text-[15px] font-medium text-ink last:border-0"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  onClick={() => setOpen(false)}
                  className="w-full py-3 text-left text-[15px] font-semibold text-ink"
                >
                  Keluar ({user.name})
                </button>
              </form>
            ) : (
              <Link
                href="/masuk"
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-semibold text-ink"
              >
                Masuk
              </Link>
            )}
          </Container>
        </nav>
      )}
    </header>
  );
}
