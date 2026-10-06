import { brand, formatBRL } from "@/lib/catalog";

const pillars = [
  {
    title: "Linha heavy",
    detail:
      "Moletom de 400 g/m², grosso mesmo. Gola alta, bolso na frente e barra reta.",
  },
  {
    title: "feito à mão",
    detail:
      "Silk, bordado e costura reforçada, aplicados peça por peça. Sai torto às vezes, e tá tudo bem.",
  },
  {
    title: "pouco de cada",
    detail: "Fazemos 50, 100 peças por modelo. Acabou, acabou.",
  },
];

export function Manifesto() {
  return (
    <section id="sobre" className="section-gap glow-red-right border-t border-line-soft">
      <div className="container-store">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-[60px]">
          <div>
            <div className="relative">
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent md:text-[11px]">
                sobre a {brand.name}
              </span>
              <span
                className="tape -top-2 right-10 hidden rotate-3 md:block"
                aria-hidden="true"
              />
            </div>
            <p className="mt-5 text-[20px] uppercase leading-[1.2] md:text-[30px]">
              {brand.statement}
            </p>
            <p className="mt-5 max-w-[52ch] text-[12px] leading-relaxed text-fg/70">
              Cada lote nasce de uma ideia e acaba quando o estoque zera. A gente
              imprime com a gráfica da esquina e costura na garagem — por isso
              some rápido. Se acabou, acabou.
            </p>
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost mt-7 inline-flex px-7 py-3.5 text-[10px] uppercase tracking-[0.2em]"
            >
              @{brand.name.toLowerCase()}.studio
            </a>
          </div>

          <ul className="flex flex-col gap-px border-t border-line-soft">
            {pillars.map((pillar, index) => (
              <li key={pillar.title} className="border-b border-line-soft py-5">
                <div className="flex items-baseline gap-4">
                  <span className="text-[10px] tracking-[0.2em] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[12px] uppercase tracking-[0.16em]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 max-w-[46ch] text-[11px] leading-relaxed text-muted">
                      {pillar.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
            <li className="border-b border-line-soft py-5">
              <div className="flex items-baseline gap-4">
                <span className="text-[10px] tracking-[0.2em] text-muted">04</span>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[0.16em]">
                    Frete grátis
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[11px] leading-relaxed text-muted">
                    Pedidos acima de {formatBRL(brand.freeShippingFrom)} não pagam
                    frete. Primeira troca grátis em todo o site.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}