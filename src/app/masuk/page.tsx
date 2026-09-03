"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Container } from "@/components/ui";
import { loginAction, type LoginState } from "./actions";

const field =
  "h-11 w-full border border-line-2 bg-surface px-3 text-[14px] focus:border-ink focus:outline-none";
const labelText = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center bg-ink px-5 text-[14px] font-semibold text-on-carbon transition-colors hover:bg-carbon disabled:opacity-60"
    >
      {pending ? "Memeriksa…" : "Masuk"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <Container className="max-w-[440px] py-16 lg:py-24">
      <span className="kicker">Akun</span>
      <h1 className="mt-3 text-[28px]">Masuk ke Bhumi</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        Lanjutkan panduan menanam dan pesananmu.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="grid gap-1.5">
          <span className={labelText}>Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="kamu@email.com"
            className={field}
          />
        </label>
        <label className="grid gap-1.5">
          <span className={labelText}>Kata sandi</span>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className={field}
          />
        </label>
        {state?.error && (
          <p className="border-l-2 border-alert bg-alert-wash px-3 py-2 text-[13px] text-alert">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-3">
        Belum punya akun?{" "}
        <Link href="/katalog" className="font-semibold text-ink underline">
          Mulai dari katalog
        </Link>
      </p>
    </Container>
  );
}
