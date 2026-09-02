import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Level } from "@/lib/data";

export function Container({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* ---------------- Buttons ---------------- */

type BtnVariant = "primary" | "solid" | "ghost";
type BtnSize = "sm" | "md";

const btnBase =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-sm transition-colors disabled:opacity-50 disabled:pointer-events-none";
const btnVariant: Record<BtnVariant, string> = {
  primary: "bg-lime text-ink hover:bg-lime-deep",
  solid: "bg-carbon text-on-carbon hover:bg-carbon-2",
  ghost:
    "border border-line-2 bg-surface text-ink hover:border-ink hover:bg-page",
};
const btnSize: Record<BtnSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[14px]",
};

export function buttonClass(
  variant: BtnVariant = "primary",
  size: BtnSize = "md",
  extra = "",
) {
  return `${btnBase} ${btnVariant[variant]} ${btnSize[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: BtnVariant; size?: BtnSize }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: BtnVariant; size?: BtnSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* ---------------- Figures ---------------- */

/** Flat stand-in for imagery not yet shot. No stripes, no gradient. */
export function Figure({
  label,
  className = "",
  ratio,
  children,
}: {
  label?: string;
  className?: string;
  ratio?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`figure relative grid place-items-center overflow-hidden ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {label ? (
        <span className="figure-label px-2 text-center">{label}</span>
      ) : null}
      {children}
    </div>
  );
}

/* ---------------- Badges ---------------- */

const LEVEL_DOT: Record<Level, string> = {
  Pemula: "bg-lime",
  Menengah: "bg-ink-2",
  Mahir: "bg-alert",
};

export function LevelBadge({
  level,
  prefix,
}: {
  level: Level;
  prefix?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-line-2 bg-surface px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-2">
      <span className={`size-1.5 ${LEVEL_DOT[level]}`} />
      {prefix ? `${prefix} ` : ""}
      {level}
    </span>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return (
    <span className="border border-line-2 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
      {children}
    </span>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-xs bg-line">
      <div
        className="h-full rounded-xs bg-lime transition-[width] duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
