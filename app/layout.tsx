import type { Metadata } from "next";
import { Roboto_Mono, Special_Elite } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});

const specialElite = Special_Elite({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-type",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NULLVOID — roupa de rua",
  description:
    "Loja de roupa de rua em preto e branco: moletons, camisetas, calças e acessórios em pequenos lotes. Troca grátis na primeira compra, Pix com 5% off e frete grátis acima de R$450.",
  keywords: [
    "NULLVOID",
    "streetwear",
    "roupa de rua",
    "camiseta oversized",
    "moletom",
    "calça cargo",
  ],
  openGraph: {
    title: "NULLVOID — roupa de rua",
    description:
      "Moletons, camisetas, calças e acessórios em pequenos lotes. Pix com 5% off e frete grátis acima de R$450.",
    type: "website",
    locale: "pt_BR",
    siteName: "NULLVOID",
  },
  twitter: {
    card: "summary_large_image",
    title: "NULLVOID — roupa de rua",
    description: "Moletons, camisetas e calças em pequenos lotes.",
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${robotoMono.variable} ${specialElite.variable}`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}