"use client";

import { Suspense, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, registerAction, type LoginState } from "./actions";
import logo from "../../../public/Bhumi-logo.jpg";
import { DisabledPill, Tabs } from "@/components/ui";

const field =
  "h-11 w-full border border-line-2 bg-surface px-3 text-[14px] focus:border-ink focus:outline-none";
const labelText = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3";

function SubmitButton({ pendingLabel, label }: { pendingLabel: string; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center bg-ink px-5 text-[14px] font-semibold text-on-carbon transition-colors hover:bg-carbon disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function PasswordField({
  name,
  label,
  placeholder = "••••••••",
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="grid gap-1.5">
      <span className={labelText}>{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          required
          minLength={6}
          placeholder={placeholder}
          className={`${field} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-ink-3 hover:text-ink"
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </label>
  );
}

function SocialButtons() {
  return (
    <div className="space-y-2.5">
      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center gap-2 border border-line-2 bg-surface px-4 text-[14px] font-medium text-ink-3 opacity-70"
      >
        Lanjut dengan Google <DisabledPill />
      </button>
      <button
        type="button"
        disabled
        className="flex h-11 w-full items-center justify-center gap-2 border border-line-2 bg-surface px-4 text-[14px] font-medium text-ink-3 opacity-70"
      >
        Masuk instan via WhatsApp / OTP <DisabledPill />
      </button>
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-3">
          Atau dengan email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <SocialButtons />
      <label className="grid gap-1.5">
        <span className={labelText}>Email atau No. Handphone</span>
        <input
          type="text"
          name="email"
          required
          placeholder="kamu@email.com"
          className={field}
        />
      </label>
      <PasswordField name="password" label="Kata sandi" />
      <div className="flex items-center justify-between text-[13px]">
        <label className="flex items-center gap-2 text-ink-2">
          <input type="checkbox" name="rememberMe" className="size-4 accent-lime" />
          Ingat saya
        </label>
        <Link href="/masuk/lupa-password" className="font-medium text-ink underline-offset-4 hover:underline">
          Lupa Password?
        </Link>
      </div>
      {state?.error && (
        <p className="border-l-2 border-alert bg-alert-wash px-3 py-2 text-[13px] text-alert">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Memeriksa…" label="Masuk ke Akun Saya →" />
    </form>
  );
}

function RegisterForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(registerAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <SocialButtons />
      <label className="grid gap-1.5">
        <span className={labelText}>Nama</span>
        <input type="text" name="name" required placeholder="Nama kamu" className={field} />
      </label>
      <label className="grid gap-1.5">
        <span className={labelText}>Email</span>
        <input type="email" name="email" required placeholder="kamu@email.com" className={field} />
      </label>
      <PasswordField name="password" label="Buat kata sandi" placeholder="Minimal 6 karakter" />
      <PasswordField name="confirm" label="Ulangi kata sandi" />
      {state?.error && (
        <p className="border-l-2 border-alert bg-alert-wash px-3 py-2 text-[13px] text-alert">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Membuat akun…" label="Buat Akun & Mulai Menanam →" />
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<"masuk" | "daftar">(
    params.get("tab") === "daftar" ? "daftar" : "masuk",
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
          <h1 className="mt-3 text-[28px]">
            {tab === "masuk" ? "Masuk ke Bhumi" : "Buat akun Bhumi"}
          </h1>
          <p className="mt-2 text-[14px] text-ink-2">
            {tab === "masuk"
              ? "Lanjutkan panduan menanam dan pesananmu."
              : "Mulai petualangan menanam bersama panduan digital Bhumi."}
          </p>

          <Tabs
            className="mt-6 w-full [&>button]:flex-1"
            tabs={[
              { value: "masuk", label: "Masuk" },
              { value: "daftar", label: "Daftar" },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === "masuk" ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 flex items-start gap-3 border border-line-2 bg-page px-3.5 py-3">
            <span aria-hidden className="mt-0.5 text-[15px]">🔒</span>
            <p className="text-[12.5px] leading-relaxed text-ink-2">
              <span className="font-semibold text-ink">Data akunmu aman.</span> Dipakai hanya
              untuk mendampingi jadwal tanam dan pesananmu di Bhumi.
            </p>
          </div>

          <p className="mt-6 text-center text-[13px] text-ink-3">
            {tab === "masuk" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setTab("daftar")}
                  className="font-semibold text-ink underline"
                >
                  Daftar sekarang
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setTab("masuk")}
                  className="font-semibold text-ink underline"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
