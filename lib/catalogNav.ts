import type { CategoryId } from "@/lib/catalog";

export const CATEGORY_EVENT = "nullvoid:category";

export function requestCategory(id: CategoryId | "all") {
  window.dispatchEvent(new CustomEvent<CategoryId | "all">(CATEGORY_EVENT, { detail: id }));
}

export function scrollToCatalog(id: CategoryId | "all") {
  requestCategory(id);
  const target = document.getElementById("catalogo");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}