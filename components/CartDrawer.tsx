"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, WhatsappIcon } from "@/components/icons";
import { Mockup } from "@/components/Mockup";
import { brand, formatBRL } from "@/lib/catalog";

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    items,
    count,
    subtotal,
    totalPix,
    setQty,
    remove,
    missingForFreeShipping,
    freeShippingProgress,
    clear,
  } = useCart();

  if (!cartOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Olá! Quero finalizar este pedido na ${brand.name}:\n\n${items
      .map(
        (item) =>
          `• ${item.name}${item.size ? ` (${item.size})` : ""} — ${item.qty} × ${formatBRL(item.price)}`
      )
      .join("\n")}\n\nSubtotal: ${formatBRL(subtotal)}\nTotal no Pix: ${formatBRL(totalPix)}`
  );

  return (
    <div className="fixed inset-0 z-[75] flex justify-end">
      <button
        type="button"
        aria-label="Fechar sacola"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-[linear-gradient(to_left,rgba(10,5,5,0.94),rgba(10,5,5,0.58)_55%,rgba(10,5,5,0.42))]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        className="relative flex h-full w-full max-w-[420px] flex-col border-l border-line bg-[linear-gradient(180deg,#1a0b0a_0%,#0a0505_46%)]"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[12px] uppercase tracking-[0.22em]">
            Sacola{" "}
            <span className="text-muted">
              ({count} {count === 1 ? "item" : "itens"})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Fechar sacola"
            className="-mr-1 p-1 text-fg transition-colors hover:text-accent"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {items.length > 0 && (
          <div className="border-b border-line px-5 py-4">
            <p className="text-[11px] text-fg/80">
              {missingForFreeShipping > 0 ? (
                <>
                  Faltam{" "}
                  <span className="text-accent">{formatBRL(missingForFreeShipping)}</span>{" "}
                  para o frete grátis
                </>
              ) : (
                <span className="text-accent">Frete grátis liberado</span>
              )}
            </p>
            <div className="mt-2 h-[3px] w-full bg-line">
              <div
                className="h-full bg-accent transition-[width] duration-500"
                style={{ width: `${freeShippingProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
                Sua sacola está vazia
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="btn-ghost px-6 py-3 text-[10px] uppercase tracking-[0.18em]"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={`${item.handle}-${item.size ?? "unico"}`}
                  className="flex gap-4 border-b border-line-soft px-5 py-4"
                >
                  <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[3px] bg-[#140706]">
                    <Mockup
                      tone={item.mock.tone}
                      className="absolute inset-0"
                      label=""
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[11px] uppercase tracking-[0.05em]">
                      {item.name}
                    </p>
                    {item.size && (
                      <p className="mt-0.5 text-[10px] text-muted">
                        Tamanho: {item.size}
                      </p>
                    )}
                    <p className="mt-0.5 text-[12px] text-accent">
                      {formatBRL(item.price * item.qty)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(item.handle, item.size, item.qty - 1)}
                          aria-label="Diminuir quantidade"
                          className="p-1.5 text-fg transition-colors hover:text-accent"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[28px] text-center text-[12px]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.handle, item.size, item.qty + 1)}
                          aria-label="Aumentar quantidade"
                          className="p-1.5 text-fg transition-colors hover:text-accent"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.handle, item.size)}
                        aria-label={`Remover ${item.name}`}
                        className="p-1.5 text-muted transition-colors hover:text-accent"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-line px-5 py-4">
            <dl className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatBRL(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-accent">Desconto no Pix (5%)</dt>
                <dd className="text-accent">-{formatBRL(subtotal - totalPix)}</dd>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-line-soft pt-2 text-[14px]">
                <dt>Total no Pix</dt>
                <dd>{formatBRL(totalPix)}</dd>
              </div>
            </dl>

            <Link
              href="/checkout"
              className="btn-accent mt-4 flex items-center justify-center gap-2 px-4 py-3.5 text-[11px] uppercase tracking-[0.18em]"
            >
              Finalizar pedido
            </Link>
            <a
              href={`${brand.phoneHref}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost mt-2 flex items-center justify-center gap-2 px-4 py-3 text-[10px] uppercase tracking-[0.18em]"
            >
              <WhatsappIcon className="h-4 w-4" />
              ou falar com a gente
            </a>
            <p className="mt-2 text-center text-[10px] text-muted">
              Pix com 5% off · 3x sem juros no cartão · primeira troca grátis
            </p>
            <button
              type="button"
              onClick={clear}
              className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
            >
              Esvaziar sacola
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}