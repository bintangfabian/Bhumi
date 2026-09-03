"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminPack, AdminStage } from "@/lib/repo/admin";
import type { Level } from "@/lib/data";
import { Button, Container } from "@/components/ui";
import { addPackAction, savePackAction } from "./actions";

const field =
  "h-10 w-full border border-line-2 bg-surface px-3 text-[14px] text-ink focus:border-ink focus:outline-none";
const labelText = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3";

export function AdminClient({ initialPacks }: { initialPacks: AdminPack[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [packs, setPacks] = useState<AdminPack[]>(initialPacks);
  const [selPack, setSelPack] = useState(initialPacks[0]?.id ?? "");
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Resync from the server after a save (real stage ids replace temp ones).
  const [prevInitialPacks, setPrevInitialPacks] = useState(initialPacks);
  if (initialPacks !== prevInitialPacks) {
    setPrevInitialPacks(initialPacks);
    setPacks(initialPacks);
  }

  const sel = packs.find((p) => p.id === selPack) ?? packs[0];
  if (!sel) {
    return (
      <Container className="py-10 lg:py-14">
        <p className="text-[14px] text-ink-2">Belum ada paket. Tambahkan satu untuk mulai.</p>
        <Button onClick={addPack} variant="primary" size="sm" className="mt-4">
          + Paket baru
        </Button>
      </Container>
    );
  }

  const totalDays = sel.stages.reduce((n, s) => n + (parseInt(s.days, 10) || 0), 0);
  const dayNote =
    totalDays === (parseInt(sel.days, 10) || 0)
      ? "Total durasi tahap cocok dengan estimasi panen."
      : `Total durasi tahap ${totalDays} hari, estimasi panen ${sel.days} hari.`;

  function editPack(fn: (p: AdminPack) => AdminPack) {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === selPack
          ? fn({
              ...p,
              stages: p.stages.map((st) => ({ ...st, checklist: [...st.checklist] })),
            })
          : p,
      ),
    );
  }

  function editStage(sid: number | string, fn: (s: AdminStage) => AdminStage) {
    editPack((p) => ({
      ...p,
      stages: p.stages.map((st) => (st.id === sid ? fn(st) : st)),
    }));
  }

  function addPack() {
    startTransition(async () => {
      const id = await addPackAction();
      setPacks((prev) => [
        ...prev,
        { id, name: "Paket baru", price: "0", level: "Pemula", days: "60", status: "Draf", sold: 0, stages: [] },
      ]);
      setSelPack(id);
    });
  }

  function addStage() {
    const id = `new-${Date.now()}`;
    editPack((p) => ({
      ...p,
      stages: [
        ...p.stages,
        { id, title: "Tahap baru", days: "7", media: "", instruction: "", checklist: [] },
      ],
    }));
    setOpenStage(id);
  }

  function moveStage(index: number, dir: -1 | 1) {
    editPack((p) => {
      const arr = [...p.stages];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...p, stages: arr };
    });
  }

  function save(status?: AdminPack["status"]) {
    const toSave = status ? { ...sel, status } : sel;
    if (status) editPack((p) => ({ ...p, status }));
    startTransition(async () => {
      await savePackAction(toSave);
      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <Container className="py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span className="kicker">Panel Admin</span>
          <h1 className="mt-3 text-[clamp(24px,3.4vw,34px)]">
            Kelola paket &amp; panduan
          </h1>
        </div>
        <Button onClick={addPack} variant="primary" size="sm" disabled={isPending}>
          + Paket baru
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[240px_1fr]">
        {/* Pack list */}
        <div>
          <div className={labelText}>Daftar paket</div>
          <div className="mt-3 border-t border-line">
            {packs.map((p) => {
              const active = p.id === sel.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelPack(p.id)}
                  className={`flex w-full items-stretch gap-3 border-b border-line py-3 text-left transition-colors ${
                    active ? "bg-surface" : "hover:bg-surface"
                  }`}
                >
                  <span
                    className={`w-0.5 shrink-0 ${active ? "bg-lime" : "bg-transparent"}`}
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="flex-1 text-[14px] font-semibold">
                        {p.name}
                      </span>
                      <span
                        className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                          p.status === "Terbit"
                            ? "border-ink text-ink"
                            : "border-line-2 text-ink-3"
                        }`}
                      >
                        {p.status}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-ink-3">
                      {p.stages.length} tahap · {p.days} hari
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-8">
          {/* Pack detail */}
          <section className="border border-line bg-surface">
            <h2 className="border-b border-line px-5 py-3.5 text-[15px]">
              Detail paket
            </h2>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="grid gap-1.5 sm:col-span-2">
                <span className={labelText}>Nama paket</span>
                <input
                  value={sel.name}
                  onChange={(e) => editPack((p) => ({ ...p, name: e.target.value }))}
                  className={field}
                />
              </label>
              <label className="grid gap-1.5">
                <span className={labelText}>Harga (Rp)</span>
                <input
                  value={sel.price}
                  onChange={(e) => editPack((p) => ({ ...p, price: e.target.value }))}
                  className={`${field} font-mono`}
                />
              </label>
              <label className="grid gap-1.5">
                <span className={labelText}>Estimasi panen (hari)</span>
                <input
                  value={sel.days}
                  onChange={(e) => editPack((p) => ({ ...p, days: e.target.value }))}
                  className={`${field} font-mono`}
                />
              </label>
              <label className="grid gap-1.5">
                <span className={labelText}>Tingkat kesulitan</span>
                <select
                  value={sel.level}
                  onChange={(e) =>
                    editPack((p) => ({ ...p, level: e.target.value as Level }))
                  }
                  className={field}
                >
                  <option>Pemula</option>
                  <option>Menengah</option>
                  <option>Mahir</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={labelText}>Status</span>
                <select
                  value={sel.status}
                  onChange={(e) =>
                    editPack((p) => ({
                      ...p,
                      status: e.target.value as AdminPack["status"],
                    }))
                  }
                  className={field}
                >
                  <option>Terbit</option>
                  <option>Draf</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
              <span className="text-[12.5px] text-ink-3">{sel.sold} terjual</span>
            </div>
          </section>

          {/* Stages */}
          <section className="border border-line bg-surface">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-[15px]">Tahap panduan</h2>
              <span className="font-mono text-[12px] text-ink-3">
                {sel.stages.length} tahap · {totalDays} hari
              </span>
            </div>

            <div className="px-5 pt-4">
              <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-3">
                {dayNote}
              </p>

              <div className="mt-4 border-t border-line">
                {sel.stages.map((st, i) => {
                  const isOpen = openStage === String(st.id);
                  return (
                    <div key={st.id} className="border-b border-line">
                      <div className="flex items-center gap-3 py-3">
                        <button
                          onClick={() =>
                            setOpenStage((cur) => (cur === String(st.id) ? null : String(st.id)))
                          }
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-xs bg-page font-mono text-[12px] font-medium">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-semibold">
                              {st.title}
                            </span>
                            <span className="block font-mono text-[11px] text-ink-3">
                              {st.checklist.length} ceklis · {st.days || 0} hari
                            </span>
                          </span>
                          <span className="font-mono text-[12px] text-ink-3">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>
                        <div className="flex gap-1">
                          <IconBtn onClick={() => moveStage(i, -1)} label="Naikkan">
                            ↑
                          </IconBtn>
                          <IconBtn onClick={() => moveStage(i, 1)} label="Turunkan">
                            ↓
                          </IconBtn>
                          <IconBtn
                            onClick={() =>
                              editPack((p) => ({
                                ...p,
                                stages: p.stages.filter((x) => x.id !== st.id),
                              }))
                            }
                            label="Hapus tahap"
                            danger
                          >
                            ×
                          </IconBtn>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="grid gap-4 border-t border-line bg-page px-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-1.5">
                              <span className={labelText}>Judul tahap</span>
                              <input
                                value={st.title}
                                onChange={(e) =>
                                  editStage(st.id, (o) => ({ ...o, title: e.target.value }))
                                }
                                className={field}
                              />
                            </label>
                            <label className="grid gap-1.5">
                              <span className={labelText}>Durasi (hari)</span>
                              <input
                                value={st.days}
                                onChange={(e) =>
                                  editStage(st.id, (o) => ({ ...o, days: e.target.value }))
                                }
                                className={`${field} font-mono`}
                              />
                            </label>
                          </div>

                          <label className="grid gap-1.5">
                            <span className={labelText}>Instruksi</span>
                            <textarea
                              value={st.instruction}
                              onChange={(e) =>
                                editStage(st.id, (o) => ({
                                  ...o,
                                  instruction: e.target.value,
                                }))
                              }
                              placeholder="Langkah yang harus dilakukan customer pada tahap ini."
                              className="min-h-[76px] w-full resize-y border border-line-2 bg-surface p-3 text-[14px] leading-relaxed focus:border-ink focus:outline-none"
                            />
                          </label>

                          <div>
                            <span className={labelText}>Media tahap</span>
                            <div className="mt-1.5 flex items-center gap-3 border border-dashed border-line-2 p-2.5">
                              <span className="figure size-9 shrink-0" />
                              <span
                                className={`min-w-0 flex-1 truncate font-mono text-[12px] ${
                                  st.media ? "text-ink" : "text-ink-3"
                                }`}
                              >
                                {st.media || "belum ada media"}
                              </span>
                              <button className="h-8 border border-line-2 bg-surface px-3 text-[12px] font-semibold hover:border-ink">
                                Ganti
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <span className={labelText}>Checklist tugas</span>
                              <button
                                onClick={() =>
                                  editStage(st.id, (o) => ({
                                    ...o,
                                    checklist: [...o.checklist, "Tugas baru"],
                                  }))
                                }
                                className="h-7 border border-line-2 bg-surface px-2.5 text-[12px] font-semibold hover:border-ink"
                              >
                                + Tugas
                              </button>
                            </div>
                            <div className="mt-2 space-y-2">
                              {st.checklist.map((c, ci) => (
                                <div key={ci} className="flex items-center gap-2">
                                  <span className="size-3.5 shrink-0 border border-line-2 bg-surface" />
                                  <input
                                    value={c}
                                    onChange={(e) =>
                                      editStage(st.id, (o) => {
                                        const arr = [...o.checklist];
                                        arr[ci] = e.target.value;
                                        return { ...o, checklist: arr };
                                      })
                                    }
                                    className="h-9 min-w-0 flex-1 border border-line-2 bg-surface px-2.5 text-[13px] focus:border-ink focus:outline-none"
                                  />
                                  <IconBtn
                                    onClick={() =>
                                      editStage(st.id, (o) => ({
                                        ...o,
                                        checklist: o.checklist.filter((_, k) => k !== ci),
                                      }))
                                    }
                                    label="Hapus tugas"
                                    danger
                                  >
                                    ×
                                  </IconBtn>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {sel.stages.length === 0 && (
                  <div className="border-b border-line py-10 text-center">
                    <div className="text-[14px] font-semibold">
                      Belum ada tahap panduan
                    </div>
                    <div className="mt-1 text-[13px] text-ink-3">
                      Tambahkan tahap sesuai struktur tanaman.
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={addStage}
                className="my-4 h-11 w-full border border-dashed border-line-2 text-[14px] font-semibold text-ink-2 hover:border-ink hover:text-ink"
              >
                + Tambah tahap panduan
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
              <span className="text-[12.5px] text-ink-3">
                {isPending ? "Menyimpan…" : savedAt ? "Tersimpan ke database." : "Perubahan belum disimpan."}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => save()}
                  disabled={isPending}
                  className="h-9 border border-line-2 bg-surface px-3.5 text-[13px] font-semibold hover:border-ink disabled:opacity-50"
                >
                  Simpan draf
                </button>
                <Button variant="primary" size="sm" onClick={() => save("Terbit")} disabled={isPending}>
                  Terbitkan paket
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid size-8 shrink-0 place-items-center border text-[13px] transition-colors ${
        danger
          ? "border-line-2 text-alert hover:border-alert"
          : "border-line-2 text-ink-3 hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
