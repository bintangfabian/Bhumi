"use client";

import { useState } from "react";
import { useCart } from "@/components/cart";
import { Button } from "@/components/ui";

export function BuyBar({
  id,
  name,
  price,
  priceLabel,
}: {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add({ id, name, price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 bg-carbon p-4 text-on-carbon">
      <div className="mr-auto">
        <div className="font-mono text-[24px] font-medium leading-none">
          {priceLabel}
        </div>
        <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-on-carbon/50">
          Gratis kirim Jabodetabek
        </div>
      </div>
      <button
        onClick={handleAdd}
        className="h-11 border border-white/25 px-4 text-[14px] font-semibold text-on-carbon transition-colors hover:border-lime hover:text-lime"
      >
        {added ? "Ditambahkan" : "+ Keranjang"}
      </button>
      <Button variant="primary">Beli paket ini</Button>
    </div>
  );
}
