"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import logo from "../../../public/Bhumi-logo.jpg";

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
  const router = useRouter();
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Kembali"
        className="fixed left-5 top-5 z-10 grid size-9 place-items-center border border-line-2 bg-surface text-ink transition-colors hover:border-ink"
      >
        <span aria-hidden className="text-[16px] leading-none">
          ←
        </span>
      </button>

      <div className="relative hidden bg-lime lg:block">
        <Image
          src={logo}
          alt="Bhumi"
          fill
          priority
          sizes="50vw"
          className="object-contain p-24"
        />
      </div>

      <div className="flex items-center justify-center px-5 py-16 sm:px-8">
        <div className="w-full max-w-[380px]">
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
        </div>
      </div>
    </div>
  );
}
