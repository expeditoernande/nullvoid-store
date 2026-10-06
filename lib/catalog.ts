export type CategoryId =
  | "premium"
  | "camisetas"
  | "moletons"
  | "calcas"
  | "headwear"
  | "acessorios"
  | "sale";

export type ProductMock = {
  tone: string;
};

export type Product = {
  handle: string
  name: string
  price: number
  pix: number
  stock: number
  soldOut: boolean
  premium: boolean
  category: Exclude<CategoryId, "premium" | "sale">
  sizes: string[]
  description: string
  mock: ProductMock
};

export const brand = {
  name: "NULLVOID",
  tagline: "roupa de rua",
  legal: "© 2026 NULLVOID. Todos os direitos reservados.",
  phone: "+55 (00) 00000-0000",
  phoneHref: "https://wa.me/5500000000000",
  instagram: "https://instagram.com/nullvoid.studio",
  club: "https://nullvoid.studio/club",
  email: "contato@nullvoid.studio",
  statement:
    "Loja pequena de roupa de rua. Moletom pesado, camiseta grande, calça folgada e um monte de coisa reaproveitada. Fazemos aos poucos, do nosso jeito.",
  freeShippingFrom: 450,
  pixDiscount: 0.05,
}

export const announcements = [
  "Troca grátis na primeira compra",
  "Pix com 5% off ou 3x sem juros",
  "Frete grátis acima de R$450",
]

export const categories: { id: CategoryId; label: string }[] = [
  { id: "premium", label: "Linha Premium" },
  { id: "camisetas", label: "Camisetas" },
  { id: "moletons", label: "Moletons" },
  { id: "calcas", label: "Calças" },
  { id: "headwear", label: "Headwear" },
  { id: "acessorios", label: "Acessórios" },
  { id: "sale", label: "Sale" },
]

export const nav: { label: string; category?: CategoryId }[] = [
  { label: "Início" },
  { label: "Produtos" },
  { label: "Linha Premium", category: "premium" },
  { label: "Camisetas", category: "camisetas" },
  { label: "Moletons", category: "moletons" },
  { label: "Calças", category: "calcas" },
  { label: "Headwear", category: "headwear" },
  { label: "Acessórios", category: "acessorios" },
  { label: "Sale", category: "sale" },
  { label: "Sobre a NULLVOID" },
]

const BONE = "#e7e3da"
const ONYX = "#141414"
const GRAPHITE = "#2b2b2b"
const ASH = "#4a4a4a"

type Seed = Omit<Product, "pix"> & { group: "new" | "featured" | "sale" };

const apparel = ["P", "M", "G", "GG"];

const seeds: Seed[] = [
  {
    handle: "nv-premium-voidweight-hoodie",
    name: "[PREMIUM] VOIDWEIGHT HOODIE",
    price: 420,
    stock: 64,
    soldOut: false,
    premium: true,
    category: "moletons",
    sizes: apparel,
    description:
      "Moletom de 480g/m² com puntada pesada, capuz duplo e bolso canguru embutido. Modelagem boxy com ombro caido e barra reta.",
    mock: { tone: ONYX },
    group: "new",
  },
  {
    handle: "nv-premium-null-zip-hoodie",
    name: "[PREMIUM] NULL ZIP HOODIE",
    price: 480,
    stock: 32,
    soldOut: false,
    premium: true,
    category: "moletons",
    sizes: apparel,
    description:
      "Versão com zíper Full Zip de alumínio, gola alta e bolsos frontais. Peça principal do lote novo.",
    mock: { tone: GRAPHITE },
    group: "new",
  },
  {
    handle: "nv-premium-obsidian-boxy-hoodie",
    name: "[PREMIUM] OBSIDIAN BOXY HOODIE",
    price: 380,
    stock: 48,
    soldOut: false,
    premium: true,
    category: "moletons",
    sizes: apparel,
    description:
      "Moletom premium sem capuz, com gola careca canelada e cordão interno. Malha penteada de toque seco.",
    mock: { tone: ASH },
    group: "new",
  },
  {
    handle: "nv-premium-halo-boxy-tee",
    name: "[PREMIUM] HALO BOXY TEE",
    price: 250,
    stock: 70,
    soldOut: false,
    premium: true,
    category: "camisetas",
    sizes: apparel,
    description:
      "Camiseta boxy em malha 30.1 com ombro caido, gola careca reforçada e barra dupla.",
    mock: { tone: ONYX },
    group: "new",
  },
  {
    handle: "nv-premium-static-boxy-tee",
    name: "[PREMIUM] STATIC BOXY TEE",
    price: 250,
    stock: 55,
    soldOut: false,
    premium: true,
    category: "camisetas",
    sizes: apparel,
    description:
      "Silk de touch seco com costura lateral recuada ebarra dupla. Modelagem ampla sem ser limitada.",
    mock: { tone: BONE },
    group: "new",
  },
  {
    handle: "nv-premium-eclipse-long-sleeve",
    name: "[PREMIUM] ECLIPSE LONG SLEEVE",
    price: 300,
    stock: 28,
    soldOut: false,
    premium: true,
    category: "camisetas",
    sizes: apparel,
    description:
      "Long sleeve premium com punho e barra canelada, malha compacta e estampa em silk de água.",
    mock: { tone: ONYX },
    group: "new",
  },
  {
    handle: "nv-riot-sign-tee",
    name: "RIOT SIGN TEE",
    price: 180,
    stock: 120,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Camiseta boxy de malha 24 com silk frontal e punho de costura dupla. Disponível nas duas cores do lote.",
    mock: { tone: ONYX },
    group: "new",
  },
  {
    handle: "nv-riot-sign-tee-bone",
    name: "RIOT SIGN TEE / BONE",
    price: 180,
    stock: 96,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Versão em vermelho queimado da Riot Sign. Base algodão penteado com toque encorpado.",
    mock: { tone: BONE },
    group: "new",
  },
  {
    handle: "nv-sigil-tee",
    name: "SIGIL TEE",
    price: 210,
    stock: 84,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Boxy tee com estampa de sigilo aplicada em plastisol. Gola careca e ombro à mesma altura do corpo.",
    mock: { tone: GRAPHITE },
    group: "new",
  },
  {
    handle: "nv-sigil-tee-bone",
    name: "SIGIL TEE / BONE",
    price: 210,
    stock: 72,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Sigil Tee na cor bone, com silk de água lavada e barra reta alongada.",
    mock: { tone: BONE },
    group: "new",
  },
  {
    handle: "nv-premium-helix-boxy-tee",
    name: "[PREMIUM] HELIX BOXY TEE",
    price: 250,
    stock: 60,
    soldOut: false,
    premium: true,
    category: "camisetas",
    sizes: apparel,
    description:
      "Malha premium com padão frontal em ponto full e costura de gola dupla.",
    mock: { tone: ASH },
    group: "featured",
  },
  {
    handle: "nv-premium-marrow-hoodie",
    name: "[PREMIUM] MARROW HOODIE",
    price: 400,
    stock: 41,
    soldOut: false,
    premium: true,
    category: "moletons",
    sizes: apparel,
    description:
      "Moletom pesado com cordãotechnico e bolso frontal aberto. Indicado para uso diurno e noturno.",
    mock: { tone: GRAPHITE },
    group: "featured",
  },
  {
    handle: "nv-premium-terminal-zip-hoodie",
    name: "[PREMIUM] TERMINAL ZIP HOODIE",
    price: 465,
    stock: 18,
    soldOut: false,
    premium: true,
    category: "moletons",
    sizes: apparel,
    description:
      "Full Zip premium com capuz forrado e bolsos laterais deep. Produção limitada.",
    mock: { tone: ONYX },
    group: "featured",
  },
  {
    handle: "nv-nullbox-long-sleeve",
    name: "NULLBOX LONG SLEEVE",
    price: 230,
    stock: 88,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Long sleeve de malha compacta com rib 1x1 no punho e costura lateral aberta.",
    mock: { tone: ONYX },
    group: "featured",
  },
  {
    handle: "nv-nullbox-long-sleeve-bone",
    name: "NULLBOX LONG SLEEVE / BONE",
    price: 230,
    stock: 64,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Versão vermelho queimado do Nullbox, com silk de água e gola careca canelada.",
    mock: { tone: BONE },
    group: "featured",
  },
  {
    handle: "nv-ghostmark-tee",
    name: "GHOSTMARK TEE",
    price: 220,
    stock: 77,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Camiseta boxy com estampa em dua — frente e costas. Malha 26 com avivamento twisted.",
    mock: { tone: ASH },
    group: "featured",
  },
  {
    handle: "nv-void-cargo-pant",
    name: "VOID CARGO PANT",
    price: 390,
    stock: 36,
    soldOut: false,
    premium: false,
    category: "calcas",
    sizes: apparel,
    description:
      "Cargo de sarja com bolsos laterais amplos, cíntura elástica e barra ajustável por velcro.",
    mock: { tone: ONYX },
    group: "featured",
  },
  {
    handle: "nv-baggy-denim-washed-black",
    name: "BAGGY DENIM / WASHED BLACK",
    price: 440,
    stock: 26,
    soldOut: false,
    premium: false,
    category: "calcas",
    sizes: apparel,
    description:
      "Denim lavado em preto, perna ampla e cintura alta com botão e passantes reforçados.",
    mock: { tone: GRAPHITE },
    group: "featured",
  },
  {
    handle: "nv-static-long-sleeve",
    name: "STATIC LONG SLEEVE",
    price: 200,
    stock: 64,
    soldOut: false,
    premium: false,
    category: "camisetas",
    sizes: apparel,
    description:
      "Long sleeve com malha leve e silk estática. Peça de entrada da linha.",
    mock: { tone: ASH },
    group: "sale",
  },
  {
    handle: "nv-ash-cargo-pant",
    name: "ASH CARGO PANT",
    price: 330,
    stock: 42,
    soldOut: false,
    premium: false,
    category: "calcas",
    sizes: apparel,
    description:
      "Cargo em sarja mescla cinza, com bolsos frontais e legível e corte reto.",
    mock: { tone: ASH },
    group: "sale",
  },
  {
    handle: "nv-flare-denim-raw-black",
    name: "FLARE DENIM / RAW BLACK",
    price: 390,
    stock: 22,
    soldOut: false,
    premium: false,
    category: "calcas",
    sizes: apparel,
    description:
      "Denim raw preto com abertura na barra e costura de bolso pintada. Lavagem escura.",
    mock: { tone: ONYX },
    group: "sale",
  },
  {
    handle: "nv-destroyed-cap-onyx",
    name: "DESTROYED CAP / ONYX",
    price: 160,
    stock: 58,
    soldOut: false,
    premium: false,
    category: "headwear",
    sizes: [],
    description:
      "Bone washed com bordado frontal e ilhoses vazados. Ajuste por fivela metálica.",
    mock: { tone: ONYX },
    group: "sale",
  },
  {
    handle: "nv-destroyed-cap-bone",
    name: "DESTROYED CAP / BONE",
    price: 160,
    stock: 46,
    soldOut: false,
    premium: false,
    category: "headwear",
    sizes: [],
    description:
      "Versão bone do Destroyed Cap, com virola desbotada e bordado tom sobre tom.",
    mock: { tone: BONE },
    group: "sale",
  },
  {
    handle: "nv-null-beanie",
    name: "NULL BEANIE",
    price: 95,
    stock: 110,
    soldOut: false,
    premium: false,
    category: "headwear",
    sizes: [],
    description:
      "Gorro em lã trançado com dobra dupla e etiqueta tecida na barra.",
    mock: { tone: ONYX },
    group: "sale",
  },
  {
    handle: "nv-sigil-beanie-bone",
    name: "SIGIL BEANIE / BONE",
    price: 95,
    stock: 90,
    soldOut: false,
    premium: false,
    category: "headwear",
    sizes: [],
    description:
      "Gorro bone com ponto uniforme e aplicações bordadas em tom básico.",
    mock: { tone: BONE },
    group: "sale",
  },
  {
    handle: "nv-stud-belt",
    name: "STUD BELT",
    price: 170,
    stock: 34,
    soldOut: false,
    premium: false,
    category: "acessorios",
    sizes: [],
    description:
      "Cintura de couro com fivela e ilhoses metálicos. Fechamento por fivela metálica.",
    mock: { tone: "#1f1f1f" },
    group: "sale",
  },
  {
    handle: "nv-slab-card-wallet",
    name: "SLAB CARD WALLET",
    price: 120,
    stock: 68,
    soldOut: false,
    premium: false,
    category: "acessorios",
    sizes: [],
    description:
      "Carteira slim em couro block com quatro compartimentos e costura reforçada.",
    mock: { tone: "#1f1f1f" },
    group: "sale",
  },
];

const round = (value: number) => Math.round(value * 100) / 100;

const withPix = (seed: Seed): Product => ({
  handle: seed.handle,
  name: seed.name,
  price: seed.price,
  pix: round(seed.price * (1 - brand.pixDiscount)),
  stock: seed.stock,
  soldOut: seed.soldOut,
  premium: seed.premium,
  category: seed.category,
  sizes: seed.sizes,
  description: seed.description,
  mock: seed.mock,
});

const groupOf = new Map(seeds.map((seed) => [seed.handle, seed.group]));
const products: Product[] = seeds.map(withPix);
const inGroup = (group: Seed["group"]) => (product: Product) =>
  groupOf.get(product.handle) === group;

export const allProducts: Product[] = products;

export const newProducts = products.filter(inGroup("new"));
export const featuredProducts = products.filter(inGroup("featured"));
export const saleProducts = products.filter(inGroup("sale"));

export function byCategory(id: CategoryId | "all"): Product[] {
  if (id === "all") return allProducts;
  if (id === "premium") return allProducts.filter((p) => p.premium);
  if (id === "sale") return saleProducts;
  return allProducts.filter((p) => p.category === id);
}

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const installments = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} em 3x sem juros`;