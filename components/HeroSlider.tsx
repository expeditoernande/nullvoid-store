"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { Mockup } from "@/components/Mockup";
import { brand } from "@/lib/catalog";
import { scrollToCatalog } from "@/lib/catalogNav";
import type { CategoryId } from "@/lib/catalog";

type Slide = {
  tone: string
  eyebrow: string
  title: string
  cta: string
  category?: CategoryId | "all"
  href?: string
  align: "left" | "center"
};

const slides: Slide[] = [
  {
    tone: "#1c1c1c",
    eyebrow: "lote novo",
    title: "Peças em edição limitada",
    cta: "Ver novidades",
    category: "all",
    align: "left",
  },
  {
    tone: "#2a2a2a",
    eyebrow: `${brand.name} Club`,
    title: "Acesso antes de todo mundo",
    cta: "Entrar",
    href: brand.club,
    align: "center",
  },
  {
    tone: "#151515",
    eyebrow: "sale",
    title: "Peças selecionadas com desconto",
    cta: "Ver sale",
    category: "sale",
    align: "left",
  },
];

const AUTOPLAY_MS = 6000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [index, paused, reduceMotion, go]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    if (start === null) return;
    touchStart.current = null;
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative isolate w-full overflow-hidden border-b border-line-soft bg-bg"
    >
      <div className="relative h-[68vh] min-h-[440px] w-full md:h-[76vh]">
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div key={slide.title} className="relative h-full w-full shrink-0">
              <Mockup
                tone={slide.tone}
                className="absolute inset-0"
                label={slide.title}
              />
              <div
                className={`absolute inset-0 ${
                  slide.align === "center"
                    ? "bg-gradient-to-t from-black/85 via-black/55 to-black/40"
                    : "bg-gradient-to-r from-black/90 via-black/55 to-transparent"
                }`}
              />
              {/* brilho vermelho atrás do texto + fade preto nas pontas */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_52%_at_18%_42%,rgba(255,43,31,0.22),transparent_72%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(44%_46%_at_92%_88%,rgba(143,16,12,0.26),transparent_74%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg via-bg/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg via-bg/55 to-transparent" />
              <div className="pointer-events-none absolute inset-0 vignette-red md:hidden" />

              <div
                className={`absolute inset-0 flex flex-col justify-end gap-4 p-5 md:justify-center md:gap-5 md:p-12 ${
                  slide.align === "center" ? "items-center text-center" : "items-start"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.34em] text-accent md:text-[11px]">
                  {slide.eyebrow}
                </span>
                {slideIndex === 0 ? (
                  <h1
                    className={`max-w-[18ch] text-[27px] uppercase leading-[1.05] text-gradient-red md:text-[48px] ${
                      slide.align === "center" ? "max-w-[22ch]" : ""
                    }`}
                  >
                    {slide.title}
                  </h1>
                ) : (
                  <p
                    className={`max-w-[18ch] text-[27px] uppercase leading-[1.05] text-gradient-red md:text-[48px] ${
                      slide.align === "center" ? "max-w-[22ch]" : ""
                    }`}
                  >
                    {slide.title}
                  </p>
                )}
                {slide.href ? (
                  <a
                    href={slide.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-accent mt-1 px-7 py-3.5 text-[11px] uppercase tracking-[0.2em]"
                  >
                    {slide.cta}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => scrollToCatalog(slide.category ?? "all")}
                    className="btn-accent mt-1 px-7 py-3.5 text-[11px] uppercase tracking-[0.2em]"
                  >
                    {slide.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Slide anterior"
              className="pointer-events-auto hidden h-9 w-9 items-center justify-center border border-line bg-gradient-to-b from-black/75 to-black/35 text-fg transition-colors hover:border-accent hover:text-accent sm:flex"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Próximo slide"
              className="pointer-events-auto hidden h-9 w-9 items-center justify-center border border-line bg-gradient-to-b from-black/75 to-black/35 text-fg transition-colors hover:border-accent hover:text-accent sm:flex"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <span className="ml-1 text-[11px] tracking-[0.2em] text-fg/80">
              <span className="text-fg">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-muted"> / {String(slides.length).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => go(dotIndex)}
                aria-label={`Ir para ${slide.eyebrow}`}
                aria-current={dotIndex === index}
                className="pointer-events-auto h-[3px] w-9 overflow-hidden bg-accent/25"
              >
                <span
                  className={`block h-full bg-accent transition-transform duration-300 ${
                    dotIndex === index ? "w-full" : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}