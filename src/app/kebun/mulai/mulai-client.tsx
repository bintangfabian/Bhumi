"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Container, Meta, Photo, Switch } from "@/components/ui";
import { addDays, idDate, todayStart, ymd } from "@/lib/format";
import type { PackDetail } from "@/lib/repo/packs";
import { activateStarterKitAction, type ActivateState } from "./actions";

const REMINDER_PRESETS = [
  { label: "Pagi Hari", time: "07:00", note: "Sebelum aktivitas harian" },
  { label: "Sebelum Kerja", time: "09:00", note: "Sinar matahari pagi paling ramah tunas", recommended: true },
  { label: "Sore Santai", time: "16:30", note: "Saat melepas penat sepulang kerja" },
  { label: "Malam Hari", time: "19:30", note: "Review santai sebelum istirahat" },
];

const START_OPTIONS = [
  { value: "today" as const, label: "Hari Ini", sub: () => "Mulai" },
  { value: "yesterday" as const, label: "Kemarin", sub: () => "−1 Hari" },
  { value: "custom" as const, label: "Pilih Lain", sub: () => "Atur tanggal" },
];

function parseRange(range: string): [number, number] | null {
  const m = range.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2])];
}

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3].map((n) => (
        <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-lime" : "bg-line"}`} />
      ))}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending} className="w-full">
      {pending ? "Menyiapkan kebun…" : "Selesaikan & Masuk ke Kebun Saya →"}
    </Button>
  );
}

export function MulaiClient({ userName, packs }: { userName: string; packs: PackDetail[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [packId, setPackId] = useState(packs[0]?.id ?? "");
  const [startOption, setStartOption] = useState<"today" | "yesterday" | "custom">("today");
  const [customDate, setCustomDate] = useState(ymd(todayStart()));
  const [reminderTime, setReminderTime] = useState("09:00");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = useActionState<ActivateState, FormData>(activateStarterKitAction, null);

  const pack = packs.find((p) => p.id === packId) ?? packs[0];

  const plantedOnDate = useMemo(() => {
    const today = todayStart();
    if (startOption === "today") return today;
    if (startOption === "yesterday") return addDays(today, -1);
    return new Date(`${customDate}T00:00:00`);
  }, [startOption, customDate]);

  const harvestOn = pack ? addDays(plantedOnDate, pack.days - 1) : null;

  const milestones = useMemo(() => {
    if (!pack) return [];
    return pack.guide.slice(0, 3).map((g) => {
      const parsed = parseRange(g.range);
      const dateRange = parsed
        ? `${idDate(addDays(plantedOnDate, parsed[0] - 1))} – ${idDate(addDays(plantedOnDate, parsed[1] - 1))}`
        : g.range;
      return { ...g, dateRange };
    });
  }, [pack, plantedOnDate]);

  async function handlePhoto(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.set("photo", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal unggah foto.");
      setPhotoUrl(data.url);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Gagal unggah foto.");
    } finally {
      setUploading(false);
    }
  }

  if (packs.length === 0) {
    return (
      <Container className="py-16 text-center">
        <p className="text-[15px] text-ink-2">Belum ada paket yang bisa diaktifkan saat ini.</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-[560px] py-10 lg:py-14">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
        <span>Bhumi Companion</span>
        <span>Langkah {step} dari 3</span>
      </div>
      <div className="mt-3">
        <StepDots step={step} />
      </div>

      {/* ---------------- Step 1: pilih tanaman ---------------- */}
      {step === 1 && (
        <div className="mt-8">
          <h1 className="text-[26px]">Mau Tanam Apa, {userName.split(" ")[0]}?</h1>
          <p className="mt-2 text-[14px] text-ink-2">
            Pilih paket yang kamu miliki (atau ingin mulai) untuk mengaktifkan panduan harian.
          </p>

          <div className="mt-6 space-y-3">
            {packs.map((p) => {
              const on = p.id === packId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPackId(p.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                    on ? "border-ink bg-lime-wash" : "border-line bg-surface hover:border-line-2"
                  }`}
                >
                  <Photo src={p.photo} alt={p.name} ratio="1 / 1" className="w-16 shrink-0 rounded-xs border border-line" sizes="64px" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-ink">{p.name}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                      <span>{p.days} hari</span>
                      <span>·</span>
                      <span className="text-ink">{p.successRate}% berhasil</span>
                      <span>·</span>
                      <span>{p.effort}</span>
                    </div>
                  </div>
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                      on ? "border-ink bg-lime" : "border-line-2 bg-surface"
                    }`}
                  >
                    {on && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" aria-hidden>
                        <polyline points="5,13 10,18 19,6" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <Button variant="primary" className="mt-7 w-full" onClick={() => setStep(2)} disabled={!packId}>
            Lanjutkan ke Perawatan →
          </Button>
        </div>
      )}

      {/* ---------------- Step 2: jadwal & pengingat ---------------- */}
      {step === 2 && pack && (
        <div className="mt-8">
          <h1 className="text-[26px]">Kapan Kamu Mulai Menyemai?</h1>
          <p className="mt-2 text-[14px] text-ink-2">
            Jadwal harian dihitung otomatis supaya panen {pack.name.replace(/^Paket\s+/i, "")} tepat
            waktu {pack.days} hari lagi.
          </p>

          <div className="mt-6 rounded-lg border border-line bg-surface p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">Tanaman dipilih</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-ink">{pack.name}</span>
              <Meta>Panen {harvestOn ? idDate(harvestOn) : "—"}</Meta>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-ink">Pilih tanggal mulai semai</h2>
              <span className="font-mono text-[11px] text-ink-3">Zona WIB</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {START_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setStartOption(o.value)}
                  className={`rounded-sm border p-3 text-left transition-colors ${
                    startOption === o.value ? "border-ink bg-lime" : "border-line-2 bg-surface hover:border-ink"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2">{o.sub()}</div>
                  <div className="mt-1 text-[13.5px] font-semibold text-ink">{o.label}</div>
                </button>
              ))}
            </div>
            {startOption === "custom" && (
              <input
                type="date"
                value={customDate}
                max={ymd(todayStart())}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-3 h-11 w-full border border-line-2 bg-surface px-3 text-[14px] focus:border-ink focus:outline-none"
              />
            )}
          </div>

          {milestones.length > 0 && (
            <div className="mt-7">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[14px] font-semibold text-ink">Prediksi milestone panen</h2>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">Otomatis</span>
              </div>
              <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
                {milestones.map((m) => (
                  <li key={m.no}>
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
                      Hari {m.range.replace("Hari ", "")} · {m.dateRange}
                    </div>
                    <div className="text-[14px] font-semibold text-ink">{m.title}</div>
                    <p className="text-[13px] leading-relaxed text-ink-2">{m.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-7">
            <h2 className="text-[14px] font-semibold text-ink">Waktu pengingat harian</h2>
            <p className="mt-1 text-[12.5px] text-ink-2">
              Satu notifikasi harian di waktu santaimu, tanpa spam.
            </p>
            <div className="mt-3 space-y-2">
              {REMINDER_PRESETS.map((r) => (
                <button
                  key={r.time}
                  type="button"
                  onClick={() => setReminderTime(r.time)}
                  className={`flex w-full items-center justify-between gap-3 rounded-sm border p-3 text-left transition-colors ${
                    reminderTime === r.time ? "border-ink bg-lime-wash" : "border-line-2 bg-surface hover:border-ink"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink">
                      {r.label}
                      {r.recommended && (
                        <span className="rounded-xs bg-lime px-1.5 py-0.5 font-mono text-[9.5px] uppercase text-ink">
                          Rekomendasi
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-ink-2">{r.note}</div>
                  </div>
                  <span className="font-mono text-[14px] font-semibold text-ink">{r.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Kembali
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => setStep(3)}>
              Lanjut ke Langkah Terakhir (3/3) →
            </Button>
          </div>
        </div>
      )}

      {/* ---------------- Step 3: foto pot & selesai ---------------- */}
      {step === 3 && pack && (
        <form action={formAction} className="mt-8">
          <input type="hidden" name="packId" value={packId} />
          <input type="hidden" name="plantedOn" value={ymd(plantedOnDate)} />
          <input type="hidden" name="reminderTime" value={reminderTime} />
          <input type="hidden" name="remindersEnabled" value={remindersEnabled ? "on" : ""} />
          <input type="hidden" name="photoUrl" value={photoUrl} />

          <h1 className="text-[26px]">Abadikan Hari Pertamamu</h1>
          <p className="mt-2 text-[14px] text-ink-2">
            Mulai jurnal foto pertumbuhan {pack.name.replace(/^Paket\s+/i, "")} (opsional, bisa
            ditambah kapan saja dari halaman Tracking).
          </p>

          <div className="mt-6">
            {photoUrl ? (
              <Photo src={photoUrl} alt="Foto pot pertama" ratio="4 / 3" className="border border-line" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center gap-2 border border-dashed border-line-2 bg-page text-center">
                <span className="text-[28px]" aria-hidden>📷</span>
                <span className="text-[14px] font-semibold text-ink">Arahkan ke pot & media tanam</span>
                <span className="max-w-[26ch] text-[12px] text-ink-3">
                  Pastikan bibit & starter kit terlihat cukup terang
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhoto(f);
              }}
            />
            <div className="mt-3 flex gap-2.5">
              <Button
                type="button"
                variant="solid"
                className="flex-1"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Mengunggah…" : photoUrl ? "Ganti Foto" : "Ambil / Pilih Foto"}
              </Button>
            </div>
            {uploadError && <p className="mt-2 text-[12.5px] text-alert">{uploadError}</p>}
            <p className="mt-2 text-[12px] text-ink-3">Opsional. Bisa dilewati sekarang dan diambil nanti.</p>
          </div>

          <div className="mt-7 flex items-center justify-between rounded-lg border border-line bg-surface p-4">
            <div>
              <div className="text-[14px] font-semibold text-ink">Aktifkan pengingat</div>
              <div className="text-[12.5px] text-ink-2">
                Tips rawat harian jam {reminderTime} supaya tidak kekeringan atau overwatering.
              </div>
            </div>
            <Switch checked={remindersEnabled} onChange={setRemindersEnabled} label="Aktifkan pengingat harian" />
          </div>

          <div className="mt-6 rounded-lg border border-line bg-page p-4">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
              <span>Ceklis starter kit</span>
              <span>3/3 lengkap</span>
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {["Pot / polybag siap", "Media tanam siap", "Bibit tersemai"].map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-1.5 rounded-xs border border-lime bg-lime-wash px-2.5 py-1 text-[12px] font-medium text-ink"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" aria-hidden>
                    <polyline points="5,13 10,18 19,6" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {state?.error && (
            <p className="mt-5 border-l-2 border-alert bg-alert-wash px-3 py-2 text-[13px] text-alert">
              {state.error}
            </p>
          )}

          <div className="mt-7 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              ← Kembali
            </Button>
            <div className="flex-1">
              <SubmitButton />
            </div>
          </div>
        </form>
      )}
    </Container>
  );
}
