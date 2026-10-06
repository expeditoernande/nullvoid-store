import type { Metadata } from "next";
import { OrderStatus } from "@/components/checkout/OrderStatus";
import { toPublicOrder } from "@/lib/checkout";
import { getOrder, storageKind } from "@/lib/db";

type Params = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Pedido ${decodeURIComponent(code)} — NULLVOID`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: Params) {
  const { code } = await params;
  const order = await getOrder(decodeURIComponent(code).trim().toUpperCase());
  const payload = order ? toPublicOrder(order, storageKind()) : null;
  return <OrderStatus code={decodeURIComponent(code)} order={payload} />;
}