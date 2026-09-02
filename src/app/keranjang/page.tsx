"use client";

import { useCart } from "@/components/cart";
import { ButtonLink, Button, Container } from "@/components/ui";

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export default function CartPage() {
  const { items, subtotal, remove } = useCart();

  return (
    <Container className="max-w-[760px] py-12 lg:py-16">
      <span className="kicker">Keranjang</span>
      <h1 className="mt-3 text-[clamp(26px,4vw,36px)]">
        {items.length} paket dipilih
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 border border-dashed border-line-2 px-6 py-16 text-center">
          <p className="text-[15px] text-ink-2">Keranjang kamu masih kosong.</p>
          <ButtonLink href="/katalog" variant="primary" className="mt-5">
            Lihat katalog paket
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <div className="mr-auto">
                  <div className="text-[15px] font-semibold">{i.name}</div>
                  <div className="font-mono text-[12px] text-ink-3">
                    {i.qty} × {rupiah(i.price)}
                  </div>
                </div>
                <div className="font-mono text-[15px] text-ink">
                  {rupiah(i.price * i.qty)}
                </div>
                <button
                  onClick={() => remove(i.id)}
                  aria-label={`Hapus ${i.name}`}
                  className="grid size-8 place-items-center border border-line-2 text-alert hover:border-alert"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-carbon p-5 text-on-carbon">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-on-carbon/50">
                Subtotal
              </div>
              <div className="font-mono text-[22px] font-medium">
                {rupiah(subtotal)}
              </div>
            </div>
            <Button variant="primary">Lanjut ke pembayaran</Button>
          </div>
        </>
      )}
    </Container>
  );
}
