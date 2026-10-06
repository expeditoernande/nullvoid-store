import { NextResponse } from "next/server";
import { toPublicOrder } from "@/lib/checkout";
import { getOrder, storageKind, updateOrderStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ code: string }> };

const publicOrder = (order: Awaited<ReturnType<typeof getOrder>>) =>
  order ? toPublicOrder(order, storageKind()) : null;

export async function GET(_request: Request, { params }: Params) {
  const { code } = await params;
  const order = await getOrder(String(code).trim().toUpperCase());
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ order: publicOrder(order) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { code } = await params;
  let action = "";
  try {
    const body = (await request.json()) as { action?: string };
    action = String(body.action ?? "");
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (action !== "confirm_payment") {
    return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  }

  const order = await updateOrderStatus(String(code).trim().toUpperCase(), "paid");
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ order: publicOrder(order) });
}