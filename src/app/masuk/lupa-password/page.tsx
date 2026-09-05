import Link from "next/link";
import { Container, DisabledPill } from "@/components/ui";

export default function LupaPasswordPage() {
  return (
    <Container className="flex min-h-screen max-w-[420px] flex-col justify-center py-16">
      <span className="kicker">Akun</span>
      <h1 className="mt-3 flex flex-wrap items-center gap-2 text-[26px]">
        Reset kata sandi <DisabledPill />
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
        Pengiriman tautan reset lewat email belum tersambung ke layanan pengirim email sungguhan,
        jadi belum bisa dipakai. Untuk sekarang, hubungi tim Bhumi langsung untuk dibantu reset
        kata sandi secara manual.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/masuk"
          className="inline-flex h-11 flex-1 items-center justify-center border border-ink px-5 text-[14px] font-semibold text-ink transition-colors hover:bg-ink hover:text-on-carbon"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </Container>
  );
}
