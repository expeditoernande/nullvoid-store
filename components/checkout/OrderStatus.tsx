"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { brand, formatBRL } from "@/lib/catalog";
import {
  maskCep,
  orderStorageKey,
  type PublicOrder,
} from "@/lib/checkout";

const statusCopy: Record<string, { label: string; detail: string }> = {
  awaiting_payment: {
    label: "aguardando pagamento",
    detail: "Falta confirmar o Pix. Assim que cair, a gente separa e manda o rastreio.",
  },
  paid: {
    label: "pago",
    detail: "Pagamento confirmado. A separação começa agora e o rastreio chega por e-mail.",
  },
  cancelled: {
    label: "cancelado",
    detail: "Pedido cancelado. Fale com a gente se foi engano.",
  },
};

/** decorative stand-in for the Pix QR: not a scannable code */
function FakeQr({ payload }: { payload: string }) {
  const cells = 21;
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
  const squares: { x: number; y: number }[] = [];
  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      if (finder(x, y)) continue;
      const code = payload.charCodeAt((x * 7 + y * 13) % Math.max(1, payload.length)) ?? 0;
      if ((code + x * y) % 3 !== 0) squares.push({ x, y });
    }
  }
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="h-[168px] w-[168px]" aria-hidden="true">
      <rect width={cells} height={cells} fill="#ff2b1f" />
      {squares.map((square) => (
        <rect key={`${square.x}-${square.y}`} x={square.x} y={square.y} width={1} height={1} fill="#000000" />
      ))}
      {[
        [0, 0],
        [cells - 7, 0],
        [0, cells - 7],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={7} height={7} fill="#000000" />
          <rect x={x + 1} y={y + 1} width={5} height={5} fill="#ff2b1f" />
          <rect x={x + 2} y={y + 2} width={3} height={3} fill="#000000" />
        </g>
      ))}
    </svg>
  );
}

export function OrderStatus({
  code,
  order: initialOrder,
}: {
  code: string;
  order: PublicOrder | null;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<PublicOrder | null>(initialOrder);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const state = order ? "ready" : "missing";

  /**
   * Sem Postgres a Vercel pode me responder de outra instância: aí o pedido vem
   * do sessionStorage que o próprio checkout gravou no navegador do cliente.
   */
  useEffect(() => {
    if (initialOrder) return;
    let cancelled = false;
    const recover = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) setOrder(data.order);
          return;
        }
      } catch {
        // cai para o sessionStorage
      }
      const raw = window.sessionStorage.getItem(orderStorageKey(code));
      if (raw && !cancelled) setOrder(JSON.parse(raw) as PublicOrder);
    };
    void recover();
    return () => {
      cancelled = true;
    };
  }, [code, initialOrder]);

  const confirmPayment = async () => {
    setWorking(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "confirm_payment" }),
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        window.sessionStorage.setItem(orderStorageKey(code), JSON.stringify(data.order));
        router.refresh();
      }
    } finally {
      setWorking(false);
    }
  };

  const copyPix = async () => {
    if (!order?.pixCode) return;
    try {
      await navigator.clipboard.writeText(order.pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(64%_38%_at_50%_0%,rgba(255,43,31,0.12),transparent_72%)] pb-24">
      <header className="border-b border-line">
        <div className="container-store flex flex-wrap items-center justify-between gap-4 py-5">
          <Link href="/" aria-label="Voltar para a loja">
            <Logo />
          </Link>
          <Link
            href="/"
            className="link-underline text-[10px] uppercase tracking-[0.18em] text-muted hover:text-accent"
          >
            voltar para a loja
          </Link>
        </div>
      </header>

      <div className="container-store pt-8">
        {state === "missing" && (
          <div className="flex flex-col items-start gap-5 py-16">
            <h1 className="section-title text-[26px] uppercase md:text-[34px]">
              Não achei esse pedido
            </h1>
            <p className="max-w-[46ch] text-[12px] leading-relaxed text-muted">
              O código <span className="text-fg">{code}</span> não existe no banco, ou o
              pedido foi criado em outra sessão de demonstração (a memória do servidor
              reinicia).
            </p>
            <Link
              href="/"
              className="btn-accent px-7 py-3.5 text-[11px] uppercase tracking-[0.18em]"
            >
              Voltar para a loja
            </Link>
          </div>
        )}

        {state === "ready" && order && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line-soft pb-5">
              <div className="relative">
                <span className="block w-fit text-[10px] uppercase tracking-[0.3em] text-accent">
                  {brand.name} / pedido
                </span>
                <h1 className="section-title mt-6 text-[28px] uppercase leading-none md:mt-8 md:text-[40px]">
                  {order.code}
                </h1>
                <span className="tape -top-5 right-20 hidden rotate-2 md:block" aria-hidden="true" />
              </div>
              <div className="text-right">
                <p className="font-type text-[13px] uppercase tracking-[0.18em]">
                  {statusCopy[order.status].label}
                </p>
                <p className="mt-1 max-w-[40ch] text-[10px] leading-relaxed text-muted">
                  {statusCopy[order.status].detail}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
              <div className="flex flex-col gap-6">
                <ul className="border border-line-soft">
                  {order.items.map((item) => (
                    <li
                      key={`${item.handle}-${item.size ?? "u"}`}
                      className="flex items-center justify-between gap-4 border-b border-line-soft p-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-[12px] uppercase">{item.name}</p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {item.size ? `tam ${item.size} · ` : ""}
                          {item.qty} × {formatBRL(item.unitPrice)}
                        </p>
                      </div>
                      <span className="text-[12px]">{formatBRL(item.total)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="grid gap-4 text-[12px] sm:grid-cols-2">
                  <div className="border border-line-soft p-4">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      Comprador
                    </dt>
                    <dd className="mt-1.5">
                      {order.customer.name}
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {order.customer.email} · {order.customer.phone} · cpf {order.customer.cpf}
                      </span>
                    </dd>
                  </div>
                  <div className="border border-line-soft p-4">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                      Entrega
                    </dt>
                    <dd className="mt-1.5">
                      {order.address.street}, {order.address.number}
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {order.address.district} · {order.address.city}/
                        {order.address.state} · {maskCep(order.address.cep)}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <aside className="lg:sticky lg:top-8 lg:self-start">
                {order.paymentMethod === "pix" && order.pixCode && (
                  <div className="mb-6 border border-line-soft p-4">
                    <div className="flex flex-col items-center gap-3 border-b border-line-soft pb-4">
                      <FakeQr payload={order.pixCode} />
                      <p className="text-center text-[10px] uppercase tracking-[0.14em] text-muted">
                        QR ilustrativo · não é pagável
                      </p>
                    </div>
                    <div className="pt-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        Pix copia e cola
                      </p>
                      <code className="mt-2 block max-h-[74px] overflow-y-auto break-all text-[10px] leading-relaxed text-muted">
                        {order.pixCode}
                      </code>
                      <button
                        type="button"
                        onClick={copyPix}
                        className="btn-ghost mt-3 w-full px-4 py-3 text-[10px] uppercase tracking-[0.18em]"
                      >
                        {copied ? "copiado" : "copiar código"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="border border-line-soft p-4">
                  <dl className="flex flex-col gap-2 text-[12px]">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd>{formatBRL(order.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Desconto Pix</dt>
                      <dd>-{formatBRL(order.discount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">
                        Frete ({order.shipping.label}, {order.shipping.days} dias)
                      </dt>
                      <dd>{order.shippingPrice === 0 ? "grátis" : formatBRL(order.shippingPrice)}</dd>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-line-soft pt-3 text-[18px]">
                      <dt>Total</dt>
                      <dd className="text-gradient-red">{formatBRL(order.total)}</dd>
                    </div>
                    {order.paymentMethod === "card" && (
                      <p className="text-[10px] text-muted">
                        3x de {formatBRL(order.installments)} sem juros
                      </p>
                    )}
                  </dl>

                  {order.status === "awaiting_payment" && (
                    <button
                      type="button"
                      onClick={confirmPayment}
                      disabled={working}
                      className="btn-accent mt-4 w-full px-4 py-3.5 text-[11px] uppercase tracking-[0.18em] disabled:opacity-60"
                    >
                      {working ? "confirmando..." : "simular pagamento"}
                    </button>
                  )}

                  <p className="mt-4 text-[10px] leading-relaxed text-muted">
                    Pedido gravado em:{" "}
                    {order.storage === "postgres"
                      ? "Postgres"
                      : order.storage === "arquivo local"
                        ? "arquivo local (dev)"
                        : "memória (demo)"}
                    . Alguma dúvida, chama no WhatsApp:{" "}
                    <a
                      href={brand.phoneHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="link-underline text-fg"
                    >
                      {brand.phone}
                    </a>
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}