"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import {
  BellIcon,
  CommunityIcon,
  LearnIcon,
  ProfileIcon,
  TasksIcon,
  TrackingIcon,
} from "@/components/nav-icons";
import { logoutAction } from "@/app/masuk/actions";
import type { SessionUser } from "@/lib/session";

const NAV = [
  { href: "/kebun", label: "Tugas", Icon: TasksIcon, match: (p: string) => p === "/kebun" },
  {
    href: "/kebun/tracking",
    label: "Tracking",
    Icon: TrackingIcon,
    match: (p: string) =>
      p.startsWith("/kebun/tracking") || p.startsWith("/kebun/panduan") || p.startsWith("/kebun/panen"),
  },
  { href: "/kebun/belajar", label: "Belajar", Icon: LearnIcon, match: (p: string) => p.startsWith("/kebun/belajar") },
  { href: "/kebun/komunitas", label: "Komunitas", Icon: CommunityIcon, match: (p: string) => p.startsWith("/kebun/komunitas") },
  {
    href: "/kebun/profil",
    label: "Profil",
    Icon: ProfileIcon,
    match: (p: string) => p.startsWith("/kebun/profil") || p.startsWith("/kebun/lencana"),
  },
];

/**
 * Shell aplikasi Kebun Saya: sidebar kiri di ≥880px, bottom tab bar 5 ikon
 * di mobile (mengikuti pola bottom nav pada desain Figma). Kalau user belum
 * login (welcome splash) atau sedang di wizard onboarding, chrome ini
 * disembunyikan supaya halaman tampil penuh tanpa distraksi.
 */
export function AppShell({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  const pathname = usePathname() ?? "/kebun";
  const bare = !user || pathname.startsWith("/kebun/mulai");

  if (bare) return <>{children}</>;

  const active = NAV.find((n) => n.match(pathname));

  return (
    <div className="min-h-screen">
      {/* ---- Desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-line bg-surface min-[880px]:flex">
        <Link href="/kebun" className="flex h-16 items-center gap-2.5 border-b border-line px-6">
          <Logo size={28} />
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => {
            const on = n.match(pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  on ? "bg-lime-wash text-ink" : "text-ink-2 hover:bg-page hover:text-ink"
                }`}
              >
                <n.Icon size={19} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <div className="px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
            {user.name}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-sm px-3 py-2 text-left text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-page hover:text-ink"
            >
              Keluar akun
            </button>
          </form>
          <Link
            href="/"
            className="mt-1 block rounded-sm px-3 py-2 text-[13px] text-ink-3 transition-colors hover:bg-page hover:text-ink"
          >
            ← Kembali ke situs
          </Link>
        </div>
      </aside>

      {/* ---- Mobile compact header ---- */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page px-4 min-[880px]:hidden">
        <Logo size={24} showWord={false} />
        <span className="font-display text-[15px] font-bold text-ink">
          {active?.label ?? "Bhumi"}
        </span>
        <div className="ml-auto flex items-center gap-3 text-ink-2">
          <span title="Notifikasi — segera hadir">
            <BellIcon size={19} />
          </span>
          <Link href="/kebun/profil" aria-label="Profil" className="text-ink">
            <ProfileIcon size={21} />
          </Link>
        </div>
      </header>

      <div className="min-[880px]:pl-[220px]">
        <main className="pb-24 min-[880px]:pb-0">{children}</main>
      </div>

      {/* ---- Mobile bottom bar ---- */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface min-[880px]:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map((n) => {
          const on = n.match(pathname);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium ${
                on ? "text-ink" : "text-ink-3"
              }`}
            >
              <n.Icon size={21} />
              <span className={on ? "text-ink" : "text-ink-3"}>{n.label}</span>
              <span className={`h-[2px] w-5 rounded-full ${on ? "bg-lime" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
