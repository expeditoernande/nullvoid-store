"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { Logo } from "@/components/Logo";
import { Mockup } from "@/components/Mockup";
import { brand, formatBRL } from "@/lib/catalog";
import {
  computeTotals,
  maskCep,
  onlyDigits,
  orderStorageKey,
  quoteShipping,
  validateAddress,
  validateCard,
  validateCustomer,
  type Address,
  type Customer,
  type PaymentMethod,
  type ResolvedLine,
} from "@/lib/checkout";

const steps = ["identificação", "entrega", "frete", "pagamento", "revisão"] as const;

type Card = { number: string; name: string; expiry: string; cvv: string };

const emptyCustomer: Customer = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
};

const emptyAddress: Address = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

const emptyCard: Card = { number: "", name: "", expiry: "", cvv: "" };

function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email" | "tel" | "decimal";
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <input
        className="field"
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? "true" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="field-error block">{error}</span>}
    </label>
  );
}

export function CheckoutFlow() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [card, setCard] = useState<Card>(emptyCard);
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [shippingId, setShippingId] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lines = useMemo<ResolvedLine[]>(
    () =>
      items.map((item) => ({
        handle: item.handle,
        name: item.name,
        size: item.size,
        qty: item.qty,
        unitPrice: item.price,
        total: item.price * item.qty,
      })),
    [items]
  );

  const quote = useMemo(
    () => (address.cep.length === 8 ? quoteShipping(address.cep, subtotal) : null),
    [address.cep, subtotal]
  );

  const shippingOption = quote?.options.find((option) => option.id === shippingId) ?? null;
  const totals = computeTotals({ lines, shipping: shippingOption, payment });

  /** CEP lookup happens on keystroke, not in an effect: same table as the server */
  const lookupAddress = async (cep: string) => {
    setCepStatus("loading");
    try {
      const params = new URLSearchParams({ cep, subtotal: String(subtotal) });
      const response = await fetch(`/api/shipping?${params.toString()}`);
      if (!response.ok) throw new Error("frete");
      const data = (await response.json()) as { address: Partial<Address> | null };
      if (data.address && (data.address.city || data.address.street)) {
        setAddress((current) => ({
          ...current,
          street: current.street || data.address?.street || "",
          district: current.district || data.address?.district || "",
          city: current.city || data.address?.city || "",
          state: current.state || data.address?.state || "",
        }));
        setCepStatus("idle");
      } else {
        setCepStatus("error");
      }
    } catch {
      setCepStatus("error");
    }
  };

  const onCepChange = (value: string) => {
    const cep = onlyDigits(value).slice(0, 8);
    setAddress((current) => ({ ...current, cep }));
    setShippingId(cep.length === 8 ? "economico" : "");
    if (cep.length === 8) void lookupAddress(cep);
    if (cep.length < 8) setCepStatus("idle");
  };

  const validateStep = (target: number) => {
    if (target === 0) return validateCustomer(customer);
    if (target === 1) return validateAddress(address);
    if (target === 2) {
      return shippingId ? {} : { shipping: "Escolha como você quer receber." };
    }
    if (target === 3 && payment === "card") {
      return validateCard({
        number: card.number,
        name: card.name,
        expiry: card.expiry,
        cvv: card.cvv,
      });
    }
    return {};
  };

  const goNext = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (step === 1 && !shippingId) {
      const options = quote?.options ?? [];
      if (options[0]) setShippingId(options[0].id);
    }
    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ handle: item.handle, size: item.size, qty: item.qty })),
          customer,
          address,
          shippingId,
          payment,
          card,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setSubmitError(data?.error ?? "Não deu para fechar o pedido.");
        return;
      }
      clear();
      window.sessionStorage.setItem(orderStorageKey(data.order.code), JSON.stringify(data.order));
      router.push(`/pedido/${data.order.code}`);
    } catch {
      setSubmitError("Falha de rede. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: string) => errors[key];

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
        <div className="flex items-end justify-between gap-6 border-b border-line-soft pb-5">
          <div className="relative">
            <span className="block w-fit text-[10px] uppercase tracking-[0.3em] text-accent">
              {brand.name} / checkout
            </span>
            <h1 className="section-title mt-6 text-[28px] uppercase leading-none md:mt-8 md:text-[40px]">
              Fechar pedido
            </h1>
            <span className="tape -top-5 right-16 hidden rotate-3 md:block" aria-hidden="true" />
          </div>
          <p className="max-w-[34ch] text-[11px] leading-relaxed text-muted">
            Cinco etapas, sem cadastro. Preencha e a gente manda o código do Pix na
            próxima tela.
          </p>
        </div>

        <ol className="steps mt-6">
          {steps.map((label, index) => (
            <li
              key={label}
              className="step"
              data-state={index === step ? "current" : index < step ? "done" : "todo"}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </li>
          ))}
        </ol>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-5 text-center">
            <p className="section-title text-[20px] uppercase md:text-[26px]">
              Sua sacola está vazia
            </p>
            <p className="max-w-[40ch] text-[12px] text-muted">
              Sem peças no carrinho não dá para fechar pedido. Escolhe uma e volta aqui.
            </p>
            <Link
              href="/"
              className="btn-accent px-7 py-3.5 text-[11px] uppercase tracking-[0.18em]"
            >
              Ver peças
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div>
              {step === 0 && (
                <section className="flex flex-col gap-5">
                  <h2 className="font-type text-[13px] uppercase tracking-[0.2em] text-accent">
                    01 / quem compra
                  </h2>
                  <TextField
                    label="Nome completo"
                    value={customer.name}
                    onChange={(name) => setCustomer((c) => ({ ...c, name }))}
                    error={field("name")}
                    autoComplete="name"
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="E-mail"
                      type="email"
                      inputMode="email"
                      value={customer.email}
                      onChange={(email) => setCustomer((c) => ({ ...c, email }))}
                      error={field("email")}
                      autoComplete="email"
                    />
                    <TextField
                      label="WhatsApp"
                      inputMode="numeric"
                      value={customer.phone}
                      onChange={(phone) =>
                        setCustomer((c) => ({ ...c, phone: onlyDigits(phone).slice(0, 11) }))
                      }
                      error={field("phone")}
                      autoComplete="tel"
                      placeholder="11999999999"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      label="CPF"
                      inputMode="numeric"
                      value={customer.cpf}
                      onChange={(cpf) =>
                        setCustomer((c) => ({ ...c, cpf: onlyDigits(cpf).slice(0, 11) }))
                      }
                      error={field("cpf")}
                      placeholder="00000000000"
                    />
                    <TextField
                      label="Nascimento"
                      type="date"
                      value={customer.birthDate}
                      onChange={(birthDate) => setCustomer((c) => ({ ...c, birthDate }))}
                      error={field("birthDate")}
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted">
                    Pede CPF e data de nascimento porque o Pix só libera pagamento para
                    pessoa física maior de 18 anos.
                  </p>
                </section>
              )}

              {step === 1 && (
                <section className="flex flex-col gap-5">
                  <h2 className="font-type text-[13px] uppercase tracking-[0.2em] text-accent">
                    02 / endereço de entrega
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
                    <TextField
                      label="CEP"
                      inputMode="numeric"
                      value={address.cep}
                      onChange={onCepChange}
                      error={field("cep")}
                      placeholder="01310-100"
                    />
                    <TextField
                      label="Rua"
                      value={address.street}
                      onChange={(street) => setAddress((a) => ({ ...a, street }))}
                      error={field("street")}
                      autoComplete="address-line1"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                    {cepStatus === "loading" && "buscando endereço..."}
                    {cepStatus === "error" &&
                      "não achamos esse CEP nos Correios, preencha a rua à mão"}
                    {cepStatus === "idle" &&
                      quote &&
                      `região: ${quote.region} · ${
                        quote.freeShipping ? "frete grátis" : "frete calculado"
                      }`}
                  </p>
                  <div className="grid gap-5 sm:grid-cols-[120px_1fr]">
                    <TextField
                      label="Número"
                      value={address.number}
                      onChange={(number) => setAddress((a) => ({ ...a, number }))}
                      error={field("number")}
                    />
                    <TextField
                      label="Complemento (opcional)"
                      value={address.complement}
                      onChange={(complement) => setAddress((a) => ({ ...a, complement }))}
                      placeholder="apto, bloco, fundos"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-[1fr_140px_80px]">
                    <TextField
                      label="Bairro"
                      value={address.district}
                      onChange={(district) => setAddress((a) => ({ ...a, district }))}
                    />
                    <TextField
                      label="Cidade"
                      value={address.city}
                      onChange={(city) => setAddress((a) => ({ ...a, city }))}
                      error={field("city")}
                    />
                    <TextField
                      label="UF"
                      value={address.state}
                      onChange={(state) =>
                        setAddress((a) => ({ ...a, state: onlyDigits(state).slice(0, 2) }))
                      }
                      error={field("state")}
                    />
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="flex flex-col gap-5">
                  <h2 className="font-type text-[13px] uppercase tracking-[0.2em] text-accent">
                    03 / como quer receber
                  </h2>
                  {!quote ? (
                    <p className="text-[12px] text-muted">
                      Volte para a etapa de endereço e informe um CEP válido para ver as
                      opções.
                    </p>
                  ) : (
                    <>
                      <p className="text-[11px] text-muted">
                        {maskCep(address.cep)} · {quote.region} ·{" "}
                        {quote.freeShipping
                          ? `frete grátis (acima de ${formatBRL(brand.freeShippingFrom)})`
                          : `frete grátis a partir de ${formatBRL(brand.freeShippingFrom)}`}
                      </p>
                      <div className="flex flex-col gap-3">
                        {quote.options.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="choice"
                            data-selected={shippingId === option.id}
                            onClick={() => setShippingId(option.id)}
                          >
                            <span className="choice-marker" aria-hidden="true" />
                            <span className="flex-1">
                              <span className="block font-type text-[14px] uppercase">
                                {option.label}
                              </span>
                              <span className="choice-meta mt-1 block text-[10px] text-muted">
                                {option.detail} · {option.days} dias úteis
                              </span>
                            </span>
                            <span className="text-[13px]">
                              {option.price === 0 ? "grátis" : formatBRL(option.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {field("shipping") && <span className="field-error">{field("shipping")}</span>}
                </section>
              )}

              {step === 3 && (
                <section className="flex flex-col gap-5">
                  <h2 className="font-type text-[13px] uppercase tracking-[0.2em] text-accent">
                    04 / pagamento
                  </h2>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      className="choice"
                      data-selected={payment === "pix"}
                      onClick={() => setPayment("pix")}
                    >
                      <span className="choice-marker" aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block font-type text-[14px] uppercase">Pix</span>
                        <span className="choice-meta mt-1 block text-[10px] text-muted">
                          {Math.round(brand.pixDiscount * 100)}% de desconto · aprovação na hora
                        </span>
                      </span>
                      <span className="text-[13px]">
                        {formatBRL(computeTotals({ lines, shipping: shippingOption, payment: "pix" }).total)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="choice"
                      data-selected={payment === "card"}
                      onClick={() => setPayment("card")}
                    >
                      <span className="choice-marker" aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block font-type text-[14px] uppercase">
                          Cartão de crédito
                        </span>
                        <span className="choice-meta mt-1 block text-[10px] text-muted">
                          3x sem juros · visa, master, elo, amex
                        </span>
                      </span>
                      <span className="text-[13px]">{formatBRL(totals.total)}</span>
                    </button>
                  </div>

                  {payment === "pix" && (
                    <div className="border border-line-soft p-4 text-[11px] leading-relaxed text-muted">
                      O QR Code e o código copia-e-cola aparecem na próxima tela, com o
                      pedido já registrado no banco. É uma demonstração: o pagamento não
                      é cobrado de verdade.
                    </div>
                  )}

                  {payment === "card" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <TextField
                          label="Número do cartão"
                          inputMode="numeric"
                          value={card.number}
                          onChange={(number) =>
                            setCard((c) => ({
                              ...c,
                              number: onlyDigits(number).slice(0, 16).replace(/(.{4})/g, "$1 ").trim(),
                            }))
                          }
                          error={field("number")}
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <TextField
                          label="Nome impresso"
                          value={card.name}
                          onChange={(name) => setCard((c) => ({ ...c, name }))}
                          error={field("name")}
                        />
                      </div>
                      <TextField
                        label="Validade"
                        inputMode="numeric"
                        value={card.expiry}
                        onChange={(expiry) => {
                          const digits = onlyDigits(expiry).slice(0, 4);
                          const formatted =
                            digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                          setCard((c) => ({ ...c, expiry: formatted }));
                        }}
                        error={field("expiry")}
                        placeholder="MM/AA"
                      />
                      <TextField
                        label="CVV"
                        inputMode="numeric"
                        value={card.cvv}
                        onChange={(cvv) => setCard((c) => ({ ...c, cvv: onlyDigits(cvv).slice(0, 4) }))}
                        error={field("cvv")}
                        placeholder="123"
                      />
                    </div>
                  )}
                </section>
              )}

              {step === 4 && (
                <section className="flex flex-col gap-5">
                  <h2 className="font-type text-[13px] uppercase tracking-[0.2em] text-accent">
                    05 / revise antes de mandar
                  </h2>
                  <dl className="border border-line-soft text-[12px]">
                    <div className="border-b border-line-soft p-4">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        Comprador
                      </dt>
                      <dd className="mt-1.5">
                        {customer.name} · {maskCep(customer.cpf)}
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {customer.email} · {customer.phone}
                        </span>
                      </dd>
                    </div>
                    <div className="border-b border-line-soft p-4">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        Entrega
                      </dt>
                      <dd className="mt-1.5">
                        {address.street}, {address.number}
                        {address.complement && ` — ${address.complement}`}
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {address.district} · {address.city}/{address.state} ·{" "}
                          {maskCep(address.cep)}
                        </span>
                      </dd>
                    </div>
                    <div className="border-b border-line-soft p-4">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        Envio
                      </dt>
                      <dd className="mt-1.5">
                        {shippingOption?.label} · {shippingOption?.days} dias úteis
                      </dd>
                    </div>
                    <div className="p-4">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                        Pagamento
                      </dt>
                      <dd className="mt-1.5 uppercase">
                        {payment === "pix" ? "Pix (5% off)" : "Cartão em 3x sem juros"}
                      </dd>
                    </div>
                  </dl>
                  {submitError && <p className="field-error">{submitError}</p>}
                </section>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="btn-ghost px-6 py-3.5 text-[10px] uppercase tracking-[0.18em]"
                  >
                    Voltar
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn-accent px-8 py-3.5 text-[11px] uppercase tracking-[0.18em]"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="btn-accent px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] disabled:opacity-60"
                  >
                    {submitting ? "Registrando..." : "Finalizar pedido"}
                  </button>
                )}
              </div>
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="border border-line-soft">
                <div className="flex items-center justify-between border-b border-line-soft p-4">
                  <h2 className="font-type text-[12px] uppercase tracking-[0.18em]">
                    Seu pedido
                  </h2>
                  <span className="sticker">demo</span>
                </div>
                <ul>
                  {items.map((item) => (
                    <li
                      key={`${item.handle}-${item.size ?? "u"}`}
                      className="flex items-center gap-3 border-b border-line-soft p-3"
                    >
                      <div className="relative h-[54px] w-[54px] shrink-0 border border-line-soft">
                        <Mockup
                          tone={item.mock.tone}
                          className="absolute inset-0"
                          label=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] uppercase">{item.name}</p>
                        <p className="text-[10px] text-muted">
                          {item.size ? `tam ${item.size} · ` : ""}
                          {item.qty} × {formatBRL(item.price)}
                        </p>
                      </div>
                      <span className="text-[12px]">{formatBRL(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="flex flex-col gap-2 p-4 text-[12px]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd>{formatBRL(totals.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">
                      Desconto no Pix ({Math.round(brand.pixDiscount * 100)}%)
                    </dt>
                    <dd>-{formatBRL(totals.discount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Frete</dt>
                    <dd>
                      {shippingOption === null
                        ? "a calcular"
                        : totals.shipping === 0
                          ? "grátis"
                          : formatBRL(totals.shipping)}
                    </dd>
                  </div>
                  <div className="mt-1 flex justify-between border-t border-line-soft pt-3 text-[16px]">
                    <dt>Total</dt>
                    <dd className="text-gradient-red">{formatBRL(totals.total)}</dd>
                  </div>
                  {payment === "card" && totals.total > 0 && (
                    <p className="text-[10px] text-muted">
                      3x de {formatBRL(totals.installments)} sem juros
                    </p>
                  )}
                </dl>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-muted">
                Checkout de demonstração: o pedido é gravado no banco e o Pix gerado é
                ilustrativo, nenhuma cobrança é feita.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}