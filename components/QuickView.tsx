"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { Mockup } from "@/components/Mockup";
import { brand, formatBRL } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";

export function QuickView() {
  const { quickView } = useCart();
  // key forces a remount per product, resetting selection without effects
  return quickView ? <QuickViewPanel key={quickView.handle} product={quickView} /> : null;
}

function QuickViewPanel({ product }: { product: Product }) {
  const { setQuickView, add } = useCart();
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  const handleAdd = () => {
    if (product.sizes.length > 0 && !size) {
      setError(true);
      return;
    }
    add(product, size, qty);
    setQuickView(null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => setQuickView(null)}
        className="absolute inset-0 h-full w-full cursor-default bg-[radial-gradient(70%_60%_at_50%_45%,rgba(26,11,10,0.9),rgba(6,3,3,0.96))]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative max-h-[92vh] w-full max-w-[1000px] overflow-y-auto border border-line bg-bg md:max-h-[88vh]"
      >
        <button
          type="button"
          onClick={() => setQuickView(null)}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 bg-gradient-to-b from-black/80 to-black/45 p-2 text-fg transition-colors hover:text-accent"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square w-full bg-[#0a0a0a]">
            <Mockup
              tone={product.mock.tone}
              className="absolute inset-0"
              label={product.name}
            />
            <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.24em] text-muted">
              desenho da peça
            </span>
          </div>

          <div className="flex flex-col gap-5 p-5 md:p-7">
            <div>
              {product.premium && (
                <span className="mb-3 inline-block rounded-[2px] bg-accent px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-black">
                  Linha Premium
                </span>
              )}
              <h2 className="text-[15px] uppercase leading-tight tracking-[0.04em]">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-[20px]">{formatBRL(product.price)}</span>
              <span className="text-[12px] text-accent">
                no Pix: {formatBRL(product.pix)}
              </span>
            </div>
            <p className="text-[11px] text-muted">
              ou{" "}
              {product.price.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              em 3x sem juros
            </p>

            {product.description && (
              <p className="text-[12px] leading-relaxed text-fg/75">
                {product.description}
              </p>
            )}

            {product.sizes.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                  Tamanho {size ? `— ${size}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSize(option);
                        setError(false);
                      }}
                      className={`h-10 min-w-[46px] border px-3 text-[12px] transition-colors ${
                        size === option
                          ? "border-accent bg-accent text-black"
                          : "btn-ghost"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="mt-2 text-[11px] text-accent">Escolha um tamanho.</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                  aria-label="Diminuir quantidade"
                  className="p-2.5 text-fg transition-colors hover:text-accent"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[34px] text-center text-[13px]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((value) => Math.min(99, value + 1))}
                  aria-label="Aumentar quantidade"
                  className="p-2.5 text-fg transition-colors hover:text-accent"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={product.soldOut}
                className="btn-accent flex-1 px-4 py-3.5 text-[11px] uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              >
                {product.soldOut ? "Esgotado" : "Adicionar à sacola"}
              </button>
            </div>

            <ul className="flex flex-col gap-1.5 border-t border-line-soft pt-4 text-[11px] text-muted">
              <li>
                Frete grátis em pedidos acima de {formatBRL(brand.freeShippingFrom)}
              </li>
              <li>Pix com 5% off ou 3x sem juros</li>
              <li>
                {product.stock > 0
                  ? `${product.stock} ${
                      product.stock === 1
                        ? "unidade disponível"
                        : "unidades disponíveis"
                    }`
                  : "Sem estoque"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}