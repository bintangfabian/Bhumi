import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getHarvestCard } from "@/lib/repo/garden";
import { ButtonLink, Container } from "@/components/ui";
import { PanenClient } from "./panen-client";

export default async function PanenPage() {
  const user = await requireUser("customer");
  const harvest = await getHarvestCard(user.id);

  if (!harvest) {
    return (
      <Container className="py-10 lg:py-14">
        <nav className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
          <Link href="/kebun" className="hover:text-ink">
            Kebun Saya
          </Link>
          <span>/</span>
          <span className="text-ink">Kartu panen</span>
        </nav>
        <div className="mt-8 max-w-[52ch]">
          <span className="kicker">Panen pertama</span>
          <h1 className="mt-3 text-[clamp(26px,4vw,38px)]">Belum ada panen</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">
            Kartu ini terbit otomatis saat lencana Panen Pertama diraih. Selesaikan panduan sampai
            tahap panen untuk membukanya.
          </p>
          <ButtonLink href="/kebun" variant="primary" className="mt-6">
            Kembali ke Kebun Saya
          </ButtonLink>
        </div>
      </Container>
    );
  }

  return <PanenClient harvest={harvest} />;
}
