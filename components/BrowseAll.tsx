"use client";

import { scrollToCatalog } from "@/lib/catalogNav";
import type { CategoryId } from "@/lib/catalog";

export function BrowseAll({
  label = "Ver todos",
  category = "all",
}: {
  label?: string
  category?: CategoryId | "all"
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToCatalog(category)}
      className="link-underline shrink-0 text-[11px] uppercase tracking-[0.16em] text-fg/70 transition-colors hover:text-accent"
    >
      {label}
    </button>
  );
}