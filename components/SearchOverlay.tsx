"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { Mockup } from "@/components/Mockup";
import { allProducts, formatBRL } from "@/lib/catalog";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function SearchOverlay() {
  const { searchOpen } = useCart();
  // panel mounts only while open, so the query field always starts empty
  return searchOpen ? <SearchPanel /> : null;
}

function SearchPanel() {
  const { setSearchOpen, setQuickView } = useCart();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (term.length < 2) return [];
    return allProducts
      .filter((product) => normalize(product.name).includes(term))
      .slice(0, 8);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[78] flex flex-col">
      <button
        type="button"
        aria-label="Fechar busca"
        onClick={() => setSearchOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-[linear-gradient(180deg,rgba(10,5,5,0.94),rgba(10,5,5,0.66))]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar produtos"
        className="relative border-b border-line bg-[linear-gradient(180deg,#180a09,#0a0505)]"
      >
        <div className="container-store flex items-center gap-4 py-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <label htmlFor="store-search" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="store-search"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por Hoodie, Boné, Calça..."
            className="h-10 flex-1 bg-transparent text-[14px] uppercase tracking-[0.04em] text-fg outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#6b6b6b]"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Fechar busca"
            className="-mr-1 p-1 text-fg transition-colors hover:text-accent"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {query.trim().length >= 2 && (
          <div className="container-store max-h-[52vh] overflow-y-auto pb-5">
            {results.length === 0 ? (
              <p className="py-6 text-[12px] uppercase tracking-[0.16em] text-muted">
                Nada encontrado para “{query.trim()}”
              </p>
            ) : (
              <ul className="grid gap-[15px] sm:grid-cols-2 md:grid-cols-4 md:gap-[30px]">
                {results.map((product) => (
                  <li key={product.handle}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setQuickView(product);
                      }}
                      className="group flex w-full gap-3 text-left"
                    >
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[3px] bg-[#140706]">
                        <Mockup
                          tone={product.mock.tone}
                          className="absolute inset-0"
                          label=""
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] uppercase tracking-[0.04em] transition-colors group-hover:text-accent">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-[12px]">
                          {formatBRL(product.price)}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-accent">
                          no Pix: {formatBRL(product.pix)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}