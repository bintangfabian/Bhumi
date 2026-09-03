"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  HEALTH_BARS,
  HEALTH_COPY,
  HEALTH_LABEL,
  RING_COUNT,
  RING_DAYS,
  STREAK_LABEL,
  type BadgeIconKey,
  type BadgeState,
  type Health,
  type MilestoneBadge,
  type StageUnlock,
  type Streak,
  type WeekDay,
} from "@/lib/gamification";
import { Logo } from "@/components/logo";

/* =====================================================================
 * Icons — flat, geometric, 1.6px stroke. Drawn from the deck, never emoji.
 * ===================================================================== */

const BADGE_PATHS: Record<BadgeIconKey, ReactNode> = {
  benih: (
    <>
      <circle cx="12" cy="9" r="3.2" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </>
  ),
  daun: (
    <>
      <line x1="12" y1="21" x2="12" y2="7" />
      <polygon points="12,13 6.5,10 12,6.5" />
      <polygon points="12,15 17.5,12 12,8.5" />
    </>
  ),
  polybag: (
    <>
      <polygon points="6,10 18,10 16.5,20 7.5,20" />
      <line x1="12" y1="10" x2="12" y2="4" />
    </>
  ),
  bunga: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="12" cy="5.5" r="2.4" />
      <circle cx="12" cy="18.5" r="2.4" />
      <circle cx="5.5" cy="12" r="2.4" />
      <circle cx="18.5" cy="12" r="2.4" />
    </>
  ),
  buah: (
    <>
      <circle cx="12" cy="14.5" r="5.2" />
      <line x1="12" y1="9" x2="12" y2="3.5" />
    </>
  ),
  "panen-1": (
    <>
      <polygon points="4,12.5 20,12.5 17.5,20.5 6.5,20.5" />
      <circle cx="12" cy="7.5" r="3.2" />
    </>
  ),
  "panen-2": (
    <>
      <polygon points="4,12.5 20,12.5 17.5,20.5 6.5,20.5" />
      <circle cx="8.2" cy="7.8" r="2.6" />
      <circle cx="15.8" cy="7.8" r="2.6" />
    </>
  ),
  musim: (
    <>
      <polygon points="8.5,3 15.5,3 21,8.5 21,15.5 15.5,21 8.5,21 3,15.5 3,8.5" />
      <circle cx="12" cy="12" r="2.2" />
    </>
  ),
};

export function BadgeIcon({
  icon,
  size = 24,
  className = "",
}: {
  icon: BadgeIconKey;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      className={className}
    >
      {BADGE_PATHS[icon]}
    </svg>
  );
}

export function ShieldIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden
      className={className}
    >
      <polygon points="12,3 20,6.5 20,12 12,21 4,12 4,6.5" />
    </svg>
  );
}

/* =====================================================================
 * Milestone badge — three states, always an octagon (deck slide 02/03).
 *   locked : 1px grey outline, faint icon, name stays readable
 *   earned : solid charcoal, lime icon, date earned
 *   new    : lime ring hugging the tile, pale wash outside it; 48h only
 * Borders can't follow clip-path, so rings are stacked octagon layers.
 * ===================================================================== */

export const OCTAGON =
  "polygon(29.29% 0, 70.71% 0, 100% 29.29%, 100% 70.71%, 70.71% 100%, 29.29% 100%, 0 70.71%, 0 29.29%)";

function Octagon({
  size,
  className = "",
  children,
}: {
  size: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size, clipPath: OCTAGON }}
    >
      {children}
    </div>
  );
}

/** The octagon alone, no label. Icon is 42% of the tile, as in the deck. */
export function BadgeTile({
  icon,
  state,
  size = 64,
  title,
}: {
  icon: BadgeIconKey;
  state: BadgeState;
  size?: number;
  title?: string;
}) {
  const iconSize = Math.round(size * 0.42);
  // Deck: 132 tile → 142 lime → 152 wash (≈4% of the tile per ring).
  const ring = Math.max(3, Math.round(size * 0.04));

  if (state === "locked") {
    return (
      <Octagon size={size} className="bg-line-2" >
        <Octagon size={size - 2} className="bg-page text-line-2">
          <span title={title} className="grid place-items-center">
            <BadgeIcon icon={icon} size={iconSize} />
          </span>
        </Octagon>
      </Octagon>
    );
  }

  const core = (
    <Octagon size={size} className="bg-carbon text-lime">
      <span title={title} className="grid place-items-center">
        <BadgeIcon icon={icon} size={iconSize} />
      </span>
    </Octagon>
  );

  if (state === "new") {
    return (
      <Octagon size={size + ring * 4} className="bg-lime-wash">
        <Octagon size={size + ring * 2} className="bg-lime">
          {core}
        </Octagon>
      </Octagon>
    );
  }

  return core;
}

export function Badge({
  badge,
  size = 64,
  showLabel = true,
}: {
  badge: MilestoneBadge;
  size?: number;
  showLabel?: boolean;
}) {
  // Reserve the ring space on every state so the row stays aligned.
  const ring = Math.max(3, Math.round(size * 0.04));
  const box = size + ring * 4;

  return (
    <div className="flex flex-col items-center text-center" style={{ width: showLabel ? box + 32 : box }}>
      <div className="grid place-items-center" style={{ width: box, height: box }}>
        <BadgeTile icon={badge.icon} state={badge.state} size={size} title={badge.name} />
      </div>
      {showLabel && (
        <>
          <div
            className={`mt-4 font-mono text-[11px] font-medium uppercase leading-tight tracking-[0.1em] ${
              badge.state === "locked" ? "text-ink-3" : "text-ink"
            }`}
          >
            {badge.name}
          </div>
          <div
            className={`mt-1 font-mono text-[11px] tracking-[0.1em] ${
              badge.state === "new"
                ? "text-ink"
                : badge.state === "earned"
                  ? "text-ink-3"
                  : "text-line-2"
            }`}
          >
            {badge.state === "locked"
              ? "Terkunci"
              : badge.state === "new"
                ? `Baru · ${badge.earnedOn}`
                : `Diraih ${badge.earnedOn}`}
          </div>
        </>
      )}
    </div>
  );
}

/* =====================================================================
 * Growth rings — the streak visual. Like tree rings on a stem: one ring
 * closes every RING_DAYS days, the outermost open ring shows progress.
 * ===================================================================== */

type RingTone = "light" | "dark" | "muted" | "faint";

function ringColors(tone: RingTone) {
  switch (tone) {
    case "dark":
      return { full: "#e4e422", empty: "#444142", dot: "#e4e422" };
    case "muted":
      return { full: "#201f1d", empty: "#d3d2ca", dot: "#201f1d" };
    case "faint":
      return { full: "#201f1d", empty: "#e4e3dd", dot: "#6f6c68" };
    default:
      return { full: "#201f1d", empty: "#d3d2ca", dot: "#201f1d" };
  }
}

export function GrowthRings({
  days,
  size = 80,
  tone = "light",
  pulse = false,
}: {
  days: number;
  size?: number;
  tone?: RingTone;
  pulse?: boolean;
}) {
  const c = ringColors(tone);
  const full = Math.min(RING_COUNT, Math.floor(days / RING_DAYS));
  const partial = full < RING_COUNT ? (days % RING_DAYS) / RING_DAYS : 0;
  // Deck: outer 106 / mid 74 / inner 42 / dot 12, all 1px strokes.
  const radii = [14, 24, 34];
  const stroke = 1.5;
  const center = 40;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      aria-label={`${days} hari berturut-turut`}
      role="img"
      className="shrink-0"
    >
      {radii.map((r, i) => {
        const circ = 2 * Math.PI * r;
        const isFull = i < full;
        const isPartial = i === full && partial > 0;
        return (
          <g key={r}>
            <circle cx={center} cy={center} r={r} fill="none" stroke={c.empty} strokeWidth={stroke} />
            {(isFull || isPartial) && (
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={c.full}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={isFull ? 0 : circ * (1 - partial)}
                transform={`rotate(-90 ${center} ${center})`}
                className="streak-arc"
              />
            )}
          </g>
        );
      })}
      {/* Center dot: day one. */}
      <circle cx={center} cy={center} r={4} fill={days >= 1 ? c.dot : c.empty} />
      {pulse && (
        <circle
          key={days}
          cx={center}
          cy={center}
          r={radii[Math.min(RING_COUNT - 1, full)]}
          fill="none"
          stroke="#e4e422"
          strokeWidth={stroke}
          strokeLinecap="butt"
          className="streak-pulse"
          style={{ transformOrigin: "40px 40px" }}
        />
      )}
    </svg>
  );
}

/* =====================================================================
 * Streak card — four variants (aktif / rekor / pelindung / mulai).
 * `days` may change at runtime; the number swaps with the deck's
 * 11 → 12 storyboard timing (check 140ms → ring 200ms → number 200ms).
 * ===================================================================== */

const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/**
 * Seven boxes, Mon → Sun. Deck: filled lime = done, 1px lime outline with
 * shield = protected, 1px grey outline = waiting. A pending day that sits
 * before a later done day was missed, and gets the deck's short dash.
 */
function WeekDots({ week, dark }: { week: WeekDay[]; dark?: boolean }) {
  const lastDone = week.reduce((acc, d, i) => (d === "pending" ? acc : i), -1);
  return (
    <div className="flex gap-2" aria-label="Tugas minggu ini">
      {week.map((d, i) => {
        const missed = d === "pending" && i < lastDone;
        return (
          <span
            key={i}
            title={`${DAY_NAMES[i]}: ${
              d === "done"
                ? "selesai"
                : d === "shield"
                  ? "pelindung dipakai"
                  : missed
                    ? "terlewat"
                    : "menunggu"
            }`}
            className={`grid size-7 place-items-center rounded-xs ${
              d === "done"
                ? "bg-lime"
                : d === "shield"
                  ? "border border-lime text-lime-deep"
                  : dark
                    ? "border border-ink-2"
                    : "border border-line-2"
            }`}
          >
            {d === "shield" && <ShieldIcon size={14} />}
            {missed && <span className="h-px w-3 bg-line-2" aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

function useAnimatedNumber(value: number) {
  const [shown, setShown] = useState(value);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = prev.current;
    prev.current = value;
    // 260 ms: ring closes.  420 ms: number swaps.  780 ms: settled.
    // With reduced motion every step collapses to the next frame.
    const at = (ms: number) => (reduce ? 0 : ms);
    const t1 = setTimeout(() => setPulse(!reduce), at(260));
    const t2 = setTimeout(() => {
      setLeaving(reduce ? null : from);
      setShown(value);
    }, at(420));
    const t3 = setTimeout(() => {
      setLeaving(null);
      setPulse(false);
    }, at(780));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [value]);

  return { shown, leaving, pulse };
}

export function StreakCard({
  streak,
  days = streak.days,
  compact = false,
  className = "",
}: {
  streak: Streak;
  /** Live override for `streak.days`, so the dashboard can bump it. */
  days?: number;
  compact?: boolean;
  className?: string;
}) {
  const dark = streak.variant === "rekor";
  const { shown, leaving, pulse } = useAnimatedNumber(days);
  const tone: RingTone =
    dark ? "dark" : streak.variant === "mulai" ? "faint" : streak.variant === "pelindung" ? "muted" : "light";

  const label = (
    <div
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] ${
        dark ? "text-lime" : "text-ink-3"
      }`}
    >
      {STREAK_LABEL[streak.variant]}
    </div>
  );

  const number = (
    <div className="relative overflow-hidden">
      <div
        key={shown}
        className={`font-display font-bold leading-none tracking-[-0.03em] ${
          compact ? "text-[36px]" : "text-[56px]"
        } ${dark ? "text-lime" : "text-ink"} ${leaving !== null ? "num-in" : ""}`}
      >
        {shown}
      </div>
      {leaving !== null && (
        <div
          aria-hidden
          className={`num-out absolute inset-0 font-display font-bold leading-none tracking-[-0.03em] ${
            compact ? "text-[36px]" : "text-[56px]"
          } ${dark ? "text-lime" : "text-ink"}`}
        >
          {leaving}
        </div>
      )}
    </div>
  );

  const unit = (
    <div
      className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
        dark ? "text-on-carbon/70" : "text-ink-3"
      }`}
    >
      Hari berturut-turut
    </div>
  );

  if (compact) {
    return (
      <div
        className={`flex items-center gap-4 rounded-lg border ${
          dark ? "border-carbon-2 bg-carbon" : "border-line bg-surface"
        } p-4 ${className}`}
      >
        <GrowthRings days={days} size={74} tone={tone} pulse={pulse} />
        <div className="min-w-0 flex-1">
          {number}
          <div className="mt-1">{unit}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border ${
        dark ? "border-carbon-2 bg-carbon" : "border-line bg-surface"
      } p-6 ${className}`}
    >
      {label}
      <div className="mt-4 flex items-center gap-5">
        <GrowthRings days={days} size={96} tone={tone} pulse={pulse} />
        <div>
          {number}
          <div className="mt-2">{unit}</div>
        </div>
      </div>
      <div className="mt-5">
        <WeekDots week={streak.week} dark={dark} />
      </div>
      <p className={`mt-4 text-[14px] leading-relaxed ${dark ? "text-on-carbon" : "text-ink-2"}`}>
        {streak.note}
      </p>
    </div>
  );
}

/* =====================================================================
 * Plant health — chip + five bars + an action sentence.
 * Drops one bar per missed task day; recovers fully after 3 good days.
 * ===================================================================== */

export function HealthChip({ health }: { health: Health }) {
  const cls =
    health === "sehat"
      ? "border-lime bg-lime-wash text-ink"
      : health === "perhatian"
        ? "border-ink bg-surface text-ink"
        : "border-alert bg-alert text-alert-wash";
  return (
    <span
      className={`inline-flex h-7 items-center rounded-sm border px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] ${cls}`}
    >
      {HEALTH_LABEL[health]}
    </span>
  );
}

export function HealthBars({
  health,
  size = "sm",
}: {
  health: Health;
  size?: "sm" | "lg";
}) {
  const on = HEALTH_BARS[health];
  const onCls =
    health === "sehat" ? "bg-lime" : health === "perhatian" ? "bg-ink" : "bg-alert";
  const dim = size === "lg" ? "h-[60px] flex-1" : "h-1.5 w-6";
  return (
    <div className={`flex ${size === "lg" ? "gap-2" : "gap-1"}`} aria-label={HEALTH_LABEL[health]}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`rounded-xs ${dim} ${
            i < on
              ? onCls
              : health === "kritis"
                ? "border border-alert bg-transparent"
                : "border border-line-2 bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

export function HealthPanel({ health }: { health: Health }) {
  const frame =
    health === "kritis"
      ? "border-alert bg-alert-wash"
      : health === "perhatian"
        ? "border-line-2 bg-surface"
        : "border-line bg-surface";
  return (
    <div className={`rounded-lg border p-7 ${frame}`}>
      <HealthChip health={health} />
      <div className="mt-5">
        <HealthBars health={health} size="lg" />
      </div>
      <p className={`mt-5 text-[14.5px] leading-relaxed ${health === "kritis" ? "text-ink" : "text-ink-2"}`}>
        {HEALTH_COPY[health]}
      </p>
    </div>
  );
}

/* =====================================================================
 * Task row with the storyboard's press → fill → draw check motion.
 * ===================================================================== */

export function CheckIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      aria-hidden
      className={className}
    >
      <polyline points="5,13 10,18 19,6" className="check-draw" pathLength={1} />
    </svg>
  );
}

export function TaskRow({
  title,
  meta,
  done,
  onToggle,
  emphasis = false,
}: {
  title: string;
  meta?: string;
  done: boolean;
  onToggle: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      onClick={onToggle}
      className="task-row flex w-full items-start gap-3.5 border-b border-line py-3.5 text-left last:border-0"
    >
      <span
        className={`mt-[1px] grid size-[26px] shrink-0 place-items-center rounded-xs border transition-colors duration-[140ms] ${
          done ? "border-lime bg-lime text-ink" : "border-ink bg-surface text-transparent"
        }`}
      >
        {done && <CheckIcon size={16} />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] ${emphasis ? "font-semibold" : "font-medium"} ${
            done ? "text-ink-3" : "text-ink"
          }`}
        >
          {title}
        </span>
        {meta && (
          <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
            {meta}
          </span>
        )}
      </span>
    </button>
  );
}

/* =====================================================================
 * Weekly challenge — dark card, lime kicker, thin progress bar.
 * ===================================================================== */

export function WeeklyChallengeCard({
  text,
  done,
  total,
  className = "",
}: {
  text: string;
  done: number;
  total: number;
  className?: string;
}) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className={`rounded-lg bg-carbon p-5 ${className}`}>
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-lime">
        Tantangan minggu ini
      </div>
      <p className="mt-2.5 text-[15px] font-medium leading-snug text-on-carbon">{text}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-xs bg-carbon-2">
          <div className="h-full rounded-xs bg-lime transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[12px] text-on-carbon">
          {done}/{total}
        </span>
      </div>
    </div>
  );
}

/* =====================================================================
 * "Naik tahap" — a full sheet that closes the previous stage before it
 * opens the next one. One button out.
 * ===================================================================== */

export function StageUnlockSheet({
  data,
  open,
  onClose,
}: {
  data: StageUnlock;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheet-backdrop fixed inset-0 z-50 grid items-end bg-ink/50 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-unlock-title"
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel mx-auto flex max-h-[92dvh] w-full max-w-[462px] flex-col overflow-y-auto rounded-t-lg bg-carbon p-8 text-on-carbon shadow-float sm:rounded-lg sm:p-9"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-lime">
              Tahap {data.stageNo} terbuka
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
              {data.range}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-8 shrink-0 place-items-center rounded-xs border border-carbon-2 text-on-carbon/70 hover:text-on-carbon"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        <h2 id="stage-unlock-title" className="mt-7 text-[clamp(30px,6vw,40px)] text-on-carbon">
          {data.title}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-on-carbon/85">{data.body}</p>

        <div className="my-6 h-px bg-carbon-2" />

        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
          Yang kamu lewati di tahap {data.stageNo - 1}
        </div>
        <ul className="mt-3 space-y-2.5">
          {data.recap.map((r) => (
            <li key={r} className="flex items-center gap-3 text-[15px] text-on-carbon">
              <span className="grid size-4 shrink-0 place-items-center text-lime">
                <CheckIcon size={12} />
              </span>
              {r}
            </li>
          ))}
        </ul>

        <Link
          href={`/kebun/panduan/${data.plantId}`}
          onClick={onClose}
          className="mt-8 inline-flex h-14 w-fit items-center rounded-sm bg-lime px-8 text-[15px] font-semibold text-ink transition-colors hover:bg-lime-deep"
        >
          Lihat tahap {data.stageNo}
        </Link>
      </div>
    </div>
  );
}

/** Locked-stage teaser rows shown beneath the plant that just levelled up. */
export function StageTeasers({ data }: { data: StageUnlock }) {
  return (
    <div className="space-y-3">
      {data.teasers.map((t, i) => (
        <div key={t.title} className="rounded-lg border border-line bg-surface p-5">
          <div className="flex gap-5">
            {i === 0 && (
              <BadgeTile icon="bunga" state="locked" size={60} />
            )}
            <div className="min-w-0 flex-1">
              {i === 0 && (
                <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">
                  Teaser terkunci
                </div>
              )}
              <div className="mt-1 text-[16px] font-semibold text-ink">{t.title}</div>
              <div className="mt-1 text-[14px] text-ink-2">{t.when}</div>
              {t.pct > 0 && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-xs bg-line">
                  <div className="h-full bg-line-2" style={{ width: `${t.pct}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
 * First-harvest share card — story (9:16) and feed (1:1).
 * Charcoal ground, lime accent, Bhumi mark in the corner. No ranking.
 * ===================================================================== */

export function HarvestCard({
  plant,
  day,
  streak,
  badges,
  photoUrl,
  ratio = "story",
  className = "",
}: {
  plant: string;
  day: number;
  streak: number;
  badges: number;
  photoUrl?: string;
  ratio?: "story" | "feed";
  className?: string;
}) {
  const photo = (
    <div
      className="figure relative grid h-full w-full place-items-center overflow-hidden rounded-xs"
      style={photoUrl ? { backgroundImage: `url(${photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {!photoUrl && <span className="figure-label">Foto tanaman</span>}
    </div>
  );

  if (ratio === "feed") {
    return (
      <div
        className={`grid aspect-square w-full grid-cols-[38%_1fr] gap-5 bg-carbon p-5 text-on-carbon ${className}`}
      >
        {photo}
        <div className="flex min-w-0 flex-col">
          <div className="font-mono text-[11px] font-medium uppercase leading-snug tracking-[0.14em] text-lime">
            Panen
            <br />
            pertama
          </div>
          <div className="mt-auto">
            <div className="font-display text-[clamp(22px,6cqw,30px)] font-bold leading-[1.05] tracking-[-0.02em]">
              {plant}
            </div>
            <div className="mt-1.5 text-[14px] text-on-carbon/80">Hari ke-{day}</div>
          </div>
          <div className="mt-5 flex gap-5 border-t border-carbon-2 pt-3 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-lime">
            <span>{streak} hari</span>
            <span>{badges} lencana</span>
          </div>
        </div>
        <Logo size={18} showWord={false} />
      </div>
    );
  }

  return (
    <div className={`flex aspect-[9/16] w-full flex-col bg-carbon p-6 text-on-carbon ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-lime">
          Panen pertama
        </span>
        <Logo size={20} showWord={false} />
      </div>
      <div className="mt-6 flex-1">{photo}</div>
      <div className="mt-6 font-display text-[clamp(26px,8cqw,39px)] font-bold leading-[1.05] tracking-[-0.02em]">
        {plant}
      </div>
      <div className="mt-2 text-[15px] text-on-carbon/80">Panen pertama di hari ke-{day}</div>
      <div className="mt-5 h-px bg-carbon-2" />
      <div className="mt-4 flex gap-8">
        <div>
          <div className="font-display text-[30px] font-bold leading-none text-lime">{streak}</div>
          <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Streak</div>
        </div>
        <div>
          <div className="font-display text-[30px] font-bold leading-none text-lime">{badges}</div>
          <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Lencana</div>
        </div>
      </div>
    </div>
  );
}
