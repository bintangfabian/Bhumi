/**
 * App-shell nav icons — flat, geometric, 1.6px stroke, drawn (never emoji).
 * Same convention as the badge icons in components/gamification.tsx.
 */
import type { ReactNode } from "react";

function Icon({ size = 20, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function TasksIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <polyline points="8,12.5 11,15.5 16,9" />
    </Icon>
  );
}

export function TrackingIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <polyline points="4,17 9.5,10.5 13.5,14 20,6" />
      <polyline points="14.5,6 20,6 20,11.5" />
    </Icon>
  );
}

export function LearnIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M4 5.5c2-1 5-1 8 0.5 3-1.5 6-1.5 8-0.5v13c-2-1-5-1-8 0.5-3-1.5-6-1.5-8-0.5z" />
      <line x1="12" y1="6" x2="12" y2="19" />
    </Icon>
  );
}

export function CommunityIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8.5" r="2.6" />
      <circle cx="17" cy="9.5" r="2.1" />
      <path d="M3.5 19c0.6-3 2.7-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
      <path d="M15 15.2c2.2 0.3 3.8 1.8 4.3 3.8" />
    </Icon>
  );
}

export function ProfileIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 19.5c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
    </Icon>
  );
}

export function BellIcon(props: { size?: number }) {
  return (
    <Icon {...props}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function ChevronDownIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <polyline points="2.5,4.5 6,8 9.5,4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
