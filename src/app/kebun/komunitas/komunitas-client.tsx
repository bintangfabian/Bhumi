"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Container, Photo } from "@/components/ui";
import type { CommunityPost, CommunityStats } from "@/lib/repo/community";
import { createPostAction, toggleLikeAction } from "./actions";

const TIPS = [
  { n: 1, title: "Top 5 kesalahan pemula yang bikin tanaman busuk akar", body: "Pelajari tanda pot tanpa drainase cukup dan cara uji jari sebelum menyiram." },
  { n: 2, title: "Waktu terbaik menyiram: pagi vs malam hari", body: "Kenapa jam 06.00–09.00 jadi golden hours bagi fotosintesis daun muda." },
];

export function KomunitasClient({
  stats,
  posts,
  plants,
}: {
  stats: CommunityStats;
  posts: CommunityPost[];
  plants: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // Optimistic overrides, keyed by post id. A post not in this map yet (e.g.
  // it just appeared after a router.refresh()) falls back to server truth —
  // see `likeState` below — instead of crashing on a missing entry.
  const [likeOverrides, setLikeOverrides] = useState<Record<number, { liked: boolean; count: number }>>({});
  function likeState(p: CommunityPost) {
    return likeOverrides[p.id] ?? { liked: p.likedByMe, count: p.likeCount };
  }
  const [composerOpen, setComposerOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [plantId, setPlantId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleLike(post: CommunityPost) {
    const cur = likeState(post);
    setLikeOverrides((prev) => ({
      ...prev,
      [post.id]: { liked: !cur.liked, count: cur.count + (cur.liked ? -1 : 1) },
    }));
    startTransition(async () => {
      await toggleLikeAction(post.id);
      router.refresh();
    });
  }

  async function handlePhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("photo", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) setPhotoUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function submitPost() {
    if (!caption.trim()) return;
    setPosting(true);
    const fd = new FormData();
    fd.set("caption", caption.trim());
    fd.set("photoUrl", photoUrl);
    fd.set("plantId", plantId);
    fd.set("tag", "umum");
    try {
      await createPostAction(fd);
      setCaption("");
      setPhotoUrl("");
      setPlantId("");
      setComposerOpen(false);
      router.refresh();
    } finally {
      setPosting(false);
    }
  }

  return (
    <Container className="max-w-[640px] py-8 lg:py-12">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] text-ink-2">
        <span aria-hidden>📍</span>
        Kamu tidak sendirian, {stats.activeMembers} sesama urban farmer aktif minggu ini.
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <div>
          <span className="kicker">Komunitas aktif</span>
          <h1 className="mt-2 text-[clamp(24px,4vw,32px)]">Inspirasi Petani Urban</h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => setComposerOpen((v) => !v)}>
          {composerOpen ? "Tutup" : "+ Cerita"}
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-carbon text-on-carbon">
        <div className="p-4">
          <div className="font-display text-[22px] font-bold leading-none text-lime">{stats.harvests}</div>
          <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-on-carbon/70">Panen tercatat</div>
        </div>
        <div className="p-4">
          <div className="font-display text-[22px] font-bold leading-none text-lime">{stats.successRatePct}%</div>
          <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-on-carbon/70">Rasio sukses</div>
        </div>
        <div className="p-4">
          <div className="font-display text-[22px] font-bold leading-none text-lime">{stats.activeMembers}</div>
          <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-on-carbon/70">Aktif minggu ini</div>
        </div>
      </div>

      {composerOpen && (
        <div className="mt-5 rounded-lg border border-line bg-surface p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ceritakan progres tanamanmu hari ini…"
            className="min-h-[70px] w-full resize-y border border-line-2 bg-page p-3 text-[14px] leading-relaxed focus:border-ink focus:outline-none"
          />
          {plants.length > 0 && (
            <select
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="mt-2.5 h-9 border border-line-2 bg-surface px-2 text-[12.5px] text-ink"
            >
              <option value="">Tanpa tanaman spesifik</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {photoUrl && (
              <Photo src={photoUrl} alt="Foto post" ratio="1 / 1" className="w-16 border border-line" sizes="64px" />
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
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="h-9 border border-line-2 bg-surface px-3 text-[12.5px] font-semibold text-ink hover:border-ink disabled:opacity-60"
            >
              {uploading ? "Mengunggah…" : photoUrl ? "Ganti foto" : "+ Foto"}
            </button>
            <Button size="sm" className="ml-auto" onClick={submitPost} disabled={posting || !caption.trim()}>
              {posting ? "Mengirim…" : "Kirim"}
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="mt-6 space-y-5">
        {posts.length === 0 && (
          <p className="py-8 text-center text-[14px] text-ink-2">Belum ada cerita. Jadilah yang pertama berbagi.</p>
        )}
        {posts.map((p) => {
          const l = likeState(p);
          return (
            <article key={p.id} className="rounded-lg border border-line bg-surface p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime font-mono text-[12px] font-semibold text-ink">
                  {p.userName.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold text-ink">{p.userName}</div>
                  <div className="font-mono text-[10.5px] text-ink-3">{p.createdAt}</div>
                </div>
                {p.plantName && (
                  <span className="shrink-0 rounded-xs border border-line-2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
                    {p.plantName}
                  </span>
                )}
              </div>
              {p.photo && (
                <Photo src={p.photo} alt={p.caption} ratio="4 / 3" className="mt-3 border border-line" sizes="600px" />
              )}
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{p.caption}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleLike(p)}
                  className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                    l.liked ? "text-alert" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  <span aria-hidden>{l.liked ? "♥" : "♡"}</span>
                  {l.count} petani terinspirasi
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Tips kurasi */}
      <section className="mt-10 mb-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px]">Tips kurasi Bhumi</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">Edisi pemula</span>
        </div>
        <div className="mt-3 space-y-3">
          {TIPS.map((t) => (
            <div key={t.n} className="flex gap-3 rounded-lg border border-line bg-surface p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime font-mono text-[12px] font-semibold text-ink">
                {t.n}
              </span>
              <div>
                <div className="text-[14px] font-semibold text-ink">{t.title}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
