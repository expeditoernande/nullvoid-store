"use client";

import { formatBRL } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { Mockup } from "@/components/Mockup";

export function ProductCard({ product }: { product: Product }) {
  const { setQuickView, add, lastAdded } = useCart();
  const added = lastAdded === product.handle;

  return (
    <article className="product-card group flex flex-col">
      <button
        type="button"
        onClick={() => setQuickView(product)}
        aria-label={`Ver ${product.name}`}
        className="product-media block w-full cursor-pointer"
      >
        {product.soldOut && <span className="badge">Esgotado</span>}
        {!product.soldOut && product.premium && (
          <span className="badge badge-accent">Premium</span>
        )}

        <Mockup
          tone={product.mock.tone}
          className="absolute inset-0"
          label={product.name}
        />

        {!product.soldOut && (
          <span className="product-cta pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-black/45 px-3 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] text-fg opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
            Ver peça
          </span>
        )}
      </button>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-[11px] uppercase leading-snug tracking-[0.06em] text-fg/90">
          <button
            type="button"
            onClick={() => setQuickView(product)}
            className="text-left transition-colors hover:text-accent"
          >
            {product.name}
          </button>
        </h3>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span
            className={`text-[13px] ${product.soldOut ? "text-muted line-through" : "text-fg"}`}
          >
            {formatBRL(product.price)}
          </span>
          {!product.soldOut && (
            <span className="text-[11px] text-accent">
              no Pix: {formatBRL(product.pix)}
            </span>
          )}
        </div>

        {!product.soldOut && (
          <button
            type="button"
            onClick={() => add(product, product.sizes[0] ?? null)}
            className={`mt-3 w-full border px-3 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors max-md:hidden ${
              added
                ? "border-accent bg-accent text-black"
                : "btn-ghost hover:border-accent"
            }`}
          >
            {added ? "Adicionado" : "Comprar"}
          </button>
        )}
      </div>
    </article>
  );
}