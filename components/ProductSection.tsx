import { BrowseAll } from "@/components/BrowseAll";
import { ProductCard } from "@/components/ProductCard";
import type { CategoryId, Product } from "@/lib/catalog";

type Props = {
  id?: string
  title: string
  subtitle?: string
  products: Product[]
  browseLabel?: string
  browseCategory?: CategoryId | "all"
  accent?: boolean
};

export function ProductSection({
  id,
  title,
  subtitle,
  products,
  browseLabel = "Ver todos",
  browseCategory = "all",
  accent = false,
}: Props) {
  return (
    <section id={id} className="section-gap">
      <div className="container-store">
        <div
          className={`mb-6 flex items-end justify-between gap-4 border-b pb-4 md:mb-8 ${
            accent ? "border-accent/40" : "border-line-soft"
          }`}
        >
          <div className="relative">
            <h2
              className={`section-title text-[13px] uppercase tracking-[0.18em] md:text-[15px] ${
                accent ? "wave-underline" : ""
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 max-w-[52ch] text-[11px] text-muted">{subtitle}</p>
            )}
            <span
              className="tape -top-3 left-2 hidden -rotate-6 md:block"
              aria-hidden="true"
            />
          </div>
          <BrowseAll label={browseLabel} category={browseCategory} />
        </div>

        <div className="store-grid">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}