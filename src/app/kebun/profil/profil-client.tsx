"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ButtonLink, Container, DisabledPill, Meta, Photo, ProgressBar, Switch, Tabs } from "@/components/ui";
import type { DashboardPlant } from "@/lib/repo/garden";
import type { HarvestedPlant, ProfileData } from "@/lib/repo/profile";
import { logoutAction } from "@/app/masuk/actions";
import { updateReminderSettingsAction } from "./actions";

export function ProfilClient({
  profile,
  activePlants,
  harvestedPlants,
  badgeCount,
  streakDays,
}: {
  profile: ProfileData;
  activePlants: DashboardPlant[];
  harvestedPlants: HarvestedPlant[];
  badgeCount: number;
  streakDays: number;
}) {
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"aktif" | "panen">("aktif");
  const [reminderTime, setReminderTime] = useState(profile.settings.reminderTime);
  const [siramEnabled, setSiramEnabled] = useState(profile.settings.siramReminderEnabled);
  const [tipsEnabled, setTipsEnabled] = useState(profile.settings.tipsEnabled);
  const [quietStart, setQuietStart] = useState(profile.settings.quietStart);
  const [quietEnd, setQuietEnd] = useState(profile.settings.quietEnd);
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    const fd = new FormData();
    fd.set("reminderTime", reminderTime);
    fd.set("siramReminderEnabled", siramEnabled ? "on" : "");
    fd.set("tipsEnabled", tipsEnabled ? "on" : "");
    fd.set("quietStart", quietStart);
    fd.set("quietEnd", quietEnd);
    startTransition(async () => {
      await updateReminderSettingsAction(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  return (
    <Container className="max-w-[640px] py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime font-display text-[22px] font-bold text-ink">
          {profile.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold text-ink">{profile.name}</div>
          <div className="mt-0.5 text-[13px] text-ink-2">Bergabung {profile.joinedOn}</div>
        </div>
        <span className="shrink-0 rounded-sm border border-lime bg-lime-wash px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink">
          Active Planter
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-surface">
        <div className="p-4 text-center">
          <div className="font-display text-[22px] font-bold leading-none">{activePlants.length}</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">Tanaman aktif</div>
        </div>
        <div className="p-4 text-center">
          <div className="font-display text-[22px] font-bold leading-none">{badgeCount}</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">Badge diraih</div>
        </div>
        <div className="p-4 text-center">
          <div className="font-display text-[22px] font-bold leading-none">{streakDays}</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">Hari streak</div>
        </div>
      </div>

      {/* Kebunku */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px]">Kebunku</h2>
          <Tabs
            tabs={[
              { value: "aktif", label: `Aktif (${activePlants.length})` },
              { value: "panen", label: `Panen (${harvestedPlants.length})` },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        <div className="mt-4 space-y-3">
          {tab === "aktif" &&
            (activePlants.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-ink-2">Belum ada tanaman aktif.</p>
            ) : (
              activePlants.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/kebun/panduan/${pl.id}`}
                  className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-ink"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-ink">{pl.name}</span>
                      <Meta>{pl.pct}%</Meta>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-3">
                      Hari ke-{pl.day} dari {pl.total} · Panen {pl.eta}
                    </div>
                    <div className="mt-2.5">
                      <ProgressBar pct={pl.pct} />
                    </div>
                  </div>
                </Link>
              ))
            ))}

          {tab === "panen" &&
            (harvestedPlants.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-ink-2">Belum ada tanaman yang dipanen.</p>
            ) : (
              harvestedPlants.map((pl) => (
                <div key={pl.id} className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4">
                  <Photo src={pl.photo} alt={pl.name} ratio="1 / 1" className="w-14 shrink-0 rounded-xs border border-line" sizes="56px" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold text-ink">{pl.name}</div>
                    <div className="font-mono text-[11px] text-ink-3">
                      {pl.pack} · Dipanen {pl.harvestedOn} · {pl.days} hari
                    </div>
                  </div>
                </div>
              ))
            ))}
        </div>

        <ButtonLink href="/kebun/mulai" variant="ghost" className="mt-3 w-full">
          + Tambah starter kit baru
        </ButtonLink>
      </section>

      {/* Jadwal & Pengingat */}
      <section className="mt-8">
        <h2 className="text-[16px]">Jadwal & pengingat</h2>
        <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Pengingat siram harian</div>
              <div className="text-[12.5px] text-ink-2">Notifikasi rutin pagi hari</div>
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="h-9 border border-line-2 bg-page px-2 text-[13px]"
              />
              <Switch checked={siramEnabled} onChange={setSiramEnabled} label="Pengingat siram harian" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Tips cerdas berkala</div>
              <div className="text-[12.5px] text-ink-2">Rekomendasi sinar & nutrisi berkala</div>
            </div>
            <Switch checked={tipsEnabled} onChange={setTipsEnabled} label="Tips cerdas berkala" />
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Jam hening (quiet hours)</div>
              <div className="text-[12.5px] text-ink-2">Tanpa notifikasi di jam ini</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[12.5px] text-ink">
              <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="h-9 border border-line-2 bg-page px-2" />
              <span className="text-ink-3">–</span>
              <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="h-9 border border-line-2 bg-page px-2" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="text-[13.5px] text-ink-2">Tes kirim pengingat</div>
            <button type="button" disabled className="flex items-center gap-2 rounded-sm border border-line-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-3 opacity-70">
              Kirim <DisabledPill />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className="mt-3 h-11 w-full rounded-sm bg-ink text-[14px] font-semibold text-on-carbon transition-colors hover:bg-carbon"
        >
          {saved ? "Tersimpan ✓" : "Simpan pengaturan"}
        </button>
      </section>

      {/* Pengaturan & bantuan */}
      <section className="mt-8">
        <h2 className="text-[16px]">Pengaturan & bantuan</h2>
        <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Bahasa aplikasi</div>
              <div className="text-[12.5px] text-ink-2">Bahasa Indonesia</div>
            </div>
          </div>
          <Link href="/kebun/belajar#faq" className="flex items-center justify-between p-4 transition-colors hover:bg-page">
            <div>
              <div className="text-[14px] font-semibold text-ink">Bantuan & FAQ</div>
              <div className="text-[12.5px] text-ink-2">Pertanyaan seputar starter kit</div>
            </div>
            <span className="text-ink-3">→</span>
          </Link>
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Tentang Bhumi</div>
              <div className="text-[12.5px] text-ink-2">Versi 1.0 MVP</div>
            </div>
          </div>
        </div>
      </section>

      <form action={logoutAction} className="mt-6 mb-10">
        <button
          type="submit"
          className="h-11 w-full rounded-sm border border-alert bg-alert-wash text-[14px] font-semibold text-alert transition-colors hover:bg-alert hover:text-alert-wash"
        >
          Keluar akun
        </button>
      </form>
    </Container>
  );
}
