import { NextResponse } from "next/server";
import {
  buildPixPayload,
  computeTotals,
  createOrderCode,
  findShippingOption,
  quoteShipping,
  resolveLines,
  sanitizeAddress,
  sanitizeCustomer,
  toPublicOrder,
  validateAddress,
  validateCard,
  validateCustomer,
  type Address,
  type Customer,
  type PaymentMethod,
} from "@/lib/checkout";
import { createOrder, storageKind } from "@/lib/db";

export const dynamic = "force-dynamic";

type Payload = {
  items?: unknown;
  customer?: Partial<Customer>;
  address?: Partial<Address>;
  shippingId?: unknown;
  payment?: unknown;
  card?: { number?: string; name?: string; expiry?: string; cvv?: string };
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Corpo invÃ¡lido." }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const { lines, errors: lineErrors } = resolveLines(
    items as { handle: string; size: string | null; qty: number }[]
  );

  const customer = sanitizeCustomer(body.customer ?? {});
  const address = sanitizeAddress(body.address ?? {});
  const payment: PaymentMethod = body.payment === "pix" ? "pix" : "card";

  const fieldErrors = {
    ...validateCustomer(customer),
    ...validateAddress(address),
  };

  if (payment === "card") {
    Object.assign(
      fieldErrors,
      validateCard({
        number: String(body.card?.number ?? ""),
        name: String(body.card?.name ?? ""),
        expiry: String(body.card?.expiry ?? ""),
        cvv: String(body.card?.cvv ?? ""),
      })
    );
  }

  if (lineErrors.length > 0 || Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Confira os dados do pedido.", lineErrors, fieldErrors },
      { status: 422 }
    );
  }

  const subtotal = lines.reduce((total, line) => total + line.total, 0);
  const quote = quoteShipping(address.cep, subtotal);
  const shippingOption = findShippingOption(quote, String(body.shippingId ?? ""));

  if (!shippingOption) {
    return NextResponse.json(
      { error: "Escolha uma opÃ§Ã£o de entrega para o seu CEP." },
      { status: 422 }
    );
  }

  const totals = computeTotals({ lines, shipping: shippingOption, payment });
  const code = createOrderCode();
  const pixCode = payment === "pix" ? buildPixPayload({ amount: totals.total, reference: code }) : null;

  const order = await createOrder({
    code,
    status: payment === "pix" ? "awaiting_payment" : "paid",
    paymentMethod: payment,
    customer,
    address,
    shipping: shippingOption,
    totals,
    items: lines,
    pixCode,
  });

  return NextResponse.json(
    { order: toPublicOrder(order, storageKind()) },
    { status: 201 }
  );
}