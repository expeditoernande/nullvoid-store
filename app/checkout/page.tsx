import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout — NULLVOID",
  description: "Fechar pedido na NULLVOID: identificação, entrega, frete, pagamento e revisão.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}