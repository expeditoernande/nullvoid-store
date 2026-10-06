import { NextResponse } from "next/server";
import { quoteShipping, onlyDigits } from "@/lib/checkout";
import { lookupCep } from "@/lib/cep";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const cep = onlyDigits(params.get("cep") ?? "");
  const subtotal = Number(params.get("subtotal") ?? "0");

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP precisa de 8 dígitos." }, { status: 400 });
  }

  const quote = quoteShipping(cep, Number.isFinite(subtotal) ? subtotal : 0);
  const address = await lookupCep(cep);

  return NextResponse.json({
    ...quote,
    address,
    source: "tabela própria de faixas de CEP",
  });
}