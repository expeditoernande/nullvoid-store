import { Newsletter } from "@/components/Newsletter";
import { InstagramIcon, ShieldIcon, WhatsappIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { brand } from "@/lib/catalog";

const mailto = (subject: string) =>
  `mailto:${brand.email}?subject=${encodeURIComponent(subject)}`;

const policyLinks = [
  { label: "Trocas e devoluções", href: mailto("Trocas e devoluções") },
  { label: "Prazos de entrega", href: mailto("Prazos de entrega") },
  { label: "Tamanhos e medidas", href: mailto("Tamanhos e medidas") },
  { label: "Pagamento e Pix", href: mailto("Pagamento") },
];

export function Footer() {
  return (
    <footer className="border-t border-line-soft bg-[linear-gradient(180deg,rgba(255,43,31,0.07)_0%,#0d0505_34%,#070303_100%)]">
      <div className="container-store">
        <div className="grid gap-10 py-12 md:grid-cols-[1fr_1fr_1.1fr] md:gap-[40px] md:py-16">
          <div>
            <Logo className="h-[18px] w-auto text-fg md:h-[22px]" />
            <p className="mt-5 max-w-[34ch] text-[11px] leading-relaxed text-muted">
              {brand.statement}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Instagram da ${brand.name}`}
                className="flex h-9 w-9 items-center justify-center border border-line text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={brand.phoneHref}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Falar no WhatsApp"
                className="flex h-9 w-9 items-center justify-center border border-line text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <WhatsappIcon className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-7 flex items-center gap-3 border border-line px-4 py-3">
              <ShieldIcon className="h-7 w-7 shrink-0 text-accent" />
              <span className="text-[10px] uppercase leading-relaxed tracking-[0.14em] text-fg/80">
                Compra segura
                <br />
                <span className="text-muted">Pagamento protegido</span>
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-[12px] uppercase tracking-[0.24em]">Contato</h2>
            <ul className="mt-5 flex flex-col gap-3 text-[12px]">
              <li>
                <a
                  href={brand.phoneHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline text-fg/85 transition-colors hover:text-accent"
                >
                  {brand.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="link-underline text-fg/85 transition-colors hover:text-accent"
                >
                  {brand.email}
                </a>
              </li>
              <li className="text-muted">Seg a Sex · 9h às 18h</li>
            </ul>

            <h2 className="mt-8 text-[12px] uppercase tracking-[0.24em]">Políticas</h2>
            <ul className="mt-5 flex flex-col gap-3 text-[12px]">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="link-underline text-fg/85 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line-soft py-6 text-[10px] tracking-[0.12em] text-muted md:flex-row md:items-center md:justify-between">
          <p className="uppercase">{brand.legal}</p>
          <p className="uppercase">
            {brand.name} — {brand.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}