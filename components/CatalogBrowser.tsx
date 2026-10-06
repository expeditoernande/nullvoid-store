"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { byCategory, categories } from "@/lib/catalog";
import type { CategoryId } from "@/lib/catalog";
import { CATEGORY_EVENT } from "@/lib/catalogNav";

const tabs: { id: CategoryId | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  ...categories,
];

export function CatalogBrowser() {
  const [active, setActive] = useState<CategoryId | "all">("all");

  useEffect(() => {
    const onCategory = (event: Event) => {
      setActive((event as CustomEvent<CategoryId | "all">).detail);
    };
    window.addEventListener(CATEGORY_EVENT, onCategory);
    return () => window.removeEventListener(CATEGORY_EVENT, onCategory);
  }, []);

  const products = useMemo(() => byCategory(active), [active]);
  const label =
    active === "all" ? "Todos os produtos" : categories.find((c) => c.id === active)?.label ?? "Produtos";

  return (
    <section id="catalogo" className="section-gap border-t border-line-soft">
      <div className="container-store">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-line-soft pb-4">
          <h2 className="text-[12px] uppercase tracking-[0.26em] md:text-[13px]">
            {label}
          </h2>
          <span className="shrink-0 text-[11px] text-muted">
            {products.length} {products.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        <div className="no-scrollbar -mx-[15px] mb-7 flex gap-2 overflow-x-auto px-[15px] md:mx-0 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`shrink-0 border px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                active === tab.id
                  ? "border-accent bg-accent text-black"
                  : "border-line text-fg/75 hover:border-fg/60 hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="store-grid">
            {products.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-[12px] uppercase tracking-[0.18em] text-muted">
            Nenhum produto nesta categoria
          </p>
        )}
      </div>
    </section>
  );
}