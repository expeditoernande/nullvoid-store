"use client";

import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useCart } from "@/components/CartProvider";
import { Logo } from "@/components/Logo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CartIcon,
  CloseIcon,
  InstagramIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  WhatsappIcon,
} from "@/components/icons";
import { brand, categories } from "@/lib/catalog";
import { CATEGORY_EVENT, scrollToCatalog } from "@/lib/catalogNav";
import type { CategoryId } from "@/lib/catalog";

const ABOUT_LABEL = `Sobre a ${brand.name}`;

const navItems: { label: string; category?: CategoryId }[] = [
  { label: "Início" },
  { label: "Produtos" },
  ...categories.map((item) => ({ label: item.label, category: item.id })),
  { label: ABOUT_LABEL },
];

export function Header() {
  const { count, setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<CategoryId | "all">("all");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onCategory = (event: Event) => {
      setActive((event as CustomEvent<CategoryId | "all">).detail);
    };
    window.addEventListener(CATEGORY_EVENT, onCategory);
    return () => window.removeEventListener(CATEGORY_EVENT, onCategory);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const nudge = (direction: 1 | -1) => {
    navRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  };

  const handleNav = (item: { label: string; category?: CategoryId }) => {
    setMenuOpen(false);
    if (item.label === "Início") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (item.label === ABOUT_LABEL) {
      document
        .getElementById("sobre")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    scrollToCatalog(item.category ?? "all");
  };

  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <TopBar />

        <div className="container-store">
          <div className="nav-row grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
                className="-ml-1 p-1.5 text-fg transition-colors hover:text-accent"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar produtos"
                className="hidden p-1.5 text-fg transition-colors hover:text-accent md:block"
              >
                <SearchIcon className="h-[22px] w-[22px]" />
              </button>
            </div>

            <a
              href="#top"
              aria-label={`${brand.name} — início`}
              className="flex items-center justify-center"
            >
              <Logo className="h-[16px] w-auto text-fg sm:h-[20px] md:h-[24px]" />
            </a>

            <div className="flex items-center justify-end gap-4">
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Instagram da ${brand.name}`}
                className="hidden p-1.5 text-fg transition-colors hover:text-accent md:block"
              >
                <UserIcon className="h-[22px] w-[22px]" />
              </a>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Abrir sacola (${count} ${count === 1 ? "item" : "itens"})`}
                className="relative -mr-1 p-1.5 text-fg transition-colors hover:text-accent"
              >
                <CartIcon className="h-[22px] w-[22px]" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-line-soft">
          <div className="container-store flex items-center gap-2">
            <button
              type="button"
              onClick={() => nudge(-1)}
              aria-label="Ver categorias anteriores"
              className="hidden shrink-0 p-1.5 text-muted transition-colors hover:text-accent md:block"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>

            <div
              ref={navRef}
              className="no-scrollbar flex flex-1 items-center gap-6 overflow-x-auto py-3"
            >
              {navItems.map((item) => {
                const isActive =
                  (item.label === "Produtos" && active === "all") ||
                  (item.category && item.category === active);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNav(item)}
                    className={`shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      isActive ? "text-accent" : "text-fg/80 hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => nudge(1)}
              aria-label="Ver próximas categorias"
              className="hidden shrink-0 p-1.5 text-muted transition-colors hover:text-accent md:block"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-[linear-gradient(180deg,rgba(10,5,5,0.92),rgba(10,5,5,0.62))]"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col border-r border-line bg-bg">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <span className="text-[11px] uppercase tracking-[0.3em] text-muted">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="-mr-1 p-1 text-fg transition-colors hover:text-accent"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.label} className="border-b border-line-soft">
                    <button
                      type="button"
                      onClick={() => handleNav(item)}
                      className="w-full py-3.5 text-left text-[12px] uppercase tracking-[0.16em] text-fg/85 transition-colors hover:text-accent"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line-soft px-5 py-4">
              <a
                href={brand.phoneHref}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 text-[12px] text-fg/80 transition-colors hover:text-accent"
              >
                <WhatsappIcon className="h-4 w-4" />
                {brand.phone}
              </a>
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 flex items-center gap-2 text-[12px] text-fg/80 transition-colors hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4" />
                @{brand.name.toLowerCase()}.studio
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}