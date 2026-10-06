"use client";

import { brand } from "@/lib/catalog";
import { Mockup } from "@/components/Mockup";
import { scrollToCatalog } from "@/lib/catalogNav";

export function BannerPair() {
  return (
    <section className="section-gap">
      <div className="container-store">
        <div className="grid gap-[15px] md:grid-cols-2 md:gap-[30px]">
          <a
            href={brand.club}
            target="_blank"
            rel="noreferrer noopener"
            className="group relative block overflow-hidden border border-line-soft bg-[#140706]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[16/9]">
              <Mockup
                tone="#242424"
                className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:rotate-[0.6deg]"
                label={`${brand.name} Club`}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,4,4,0.94),rgba(8,4,4,0.4)_45%,transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_84%_0%,rgba(255,43,31,0.26),transparent_66%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/70 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 md:p-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent md:text-[11px]">
                  club
                </span>
                <h3 className="max-w-[16ch] text-[19px] uppercase leading-tight md:text-[27px]">
                  <span className="wave-underline">Entra no club</span> e compra antes
                </h3>
                <span className="w-fit border border-line px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors group-hover:border-accent group-hover:text-accent">
                  Entrar
                </span>
                <span
                  className="tape right-6 top-5 hidden rotate-6 md:block"
                  aria-hidden="true"
                />
              </div>
            </div>
          </a>

          <button
            type="button"
            onClick={() => scrollToCatalog("sale")}
            className="group relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden border-2 border-black bg-[linear-gradient(158deg,#ff5347_0%,#ff2b1f_44%,#a3130f_100%)] p-5 text-left md:aspect-[16/9] md:p-8"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-black/70 md:text-[11px]">
              sale
            </span>
            <span className="section-title text-[30px] uppercase leading-[0.95] text-black md:text-[46px]">
              tá tudo
              <br />
              barato
            </span>
            <span className="w-fit border-2 border-black bg-black px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-accent transition-transform group-hover:-translate-y-0.5 group-hover:rotate-1">
              ver +
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}