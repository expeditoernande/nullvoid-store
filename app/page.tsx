import { BannerPair } from "@/components/BannerPair";
import { CartDrawer } from "@/components/CartDrawer";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { Manifesto } from "@/components/Manifesto";
import { ProductSection } from "@/components/ProductSection";
import { QuickView } from "@/components/QuickView";
import { SearchOverlay } from "@/components/SearchOverlay";
import {
  brand,
  featuredProducts,
  newProducts,
  saleProducts,
} from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <div id="top" />
      <Header />

      <main>
        <HeroSlider />

        <ProductSection
          title="Novidades"
          subtitle={`Novidades — ${newProducts.length} peças no estoque`}
          products={newProducts}
          browseCategory="all"
        />

        <BannerPair />

        <ProductSection
          title={`Destaques ${brand.name}`}
          subtitle="Os mais pedidos da linha premium e boxy"
          products={featuredProducts}
          browseCategory="premium"
          browseLabel="Ver linha premium"
        />

        <ProductSection
          title="Sale"
          subtitle="Peças selecionadas com desconto"
          products={saleProducts}
          browseCategory="sale"
          browseLabel="Ver toda a sale"
          accent
        />

        <CatalogBrowser />

        <Manifesto />
      </main>

      <Footer />

      <CartDrawer />
      <SearchOverlay />
      <QuickView />
    </>
  );
}