import Link from "next/link";
import { Button, Container } from "@/components/ui";

const field =
  "h-11 w-full border border-line-2 bg-surface px-3 text-[14px] focus:border-ink focus:outline-none";
const labelText = "font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3";

export default function LoginPage() {
  return (
    <Container className="max-w-[440px] py-16 lg:py-24">
      <span className="kicker">Akun</span>
      <h1 className="mt-3 text-[28px]">Masuk ke Bhumi</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        Lanjutkan panduan menanam dan pesananmu.
      </p>

      <form className="mt-8 space-y-4">
        <label className="grid gap-1.5">
          <span className={labelText}>Email</span>
          <input type="email" placeholder="kamu@email.com" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className={labelText}>Kata sandi</span>
          <input type="password" placeholder="••••••••" className={field} />
        </label>
        <Button type="button" variant="primary" className="w-full">
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-3">
        Belum punya akun?{" "}
        <Link href="/#katalog" className="font-semibold text-ink underline">
          Mulai dari katalog
        </Link>
      </p>
    </Container>
  );
}
