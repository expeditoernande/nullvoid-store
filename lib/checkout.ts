import { allProducts, brand } from "@/lib/catalog";

export type CheckoutLine = {
  handle: string;
  size: string | null;
  qty: number;
};

export type ResolvedLine = {
  handle: string;
  name: string;
  size: string | null;
  qty: number;
  unitPrice: number;
  total: number;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
};

export type Address = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export type PaymentMethod = "pix" | "card";

export type ShippingOption = {
  id: string;
  label: string;
  detail: string;
  price: number;
  days: number;
};

export type ShippingQuote = {
  cep: string;
  region: string;
  freeShipping: boolean;
  options: ShippingOption[];
};

export type OrderTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  installments: number;
  freeShipping: boolean;
};

export const onlyDigits = (value: string) => value.replace(/\D+/g, "");

export const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function maskCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value;
  return `***.***.***-${digits.slice(9)}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

export function isValidBirthDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const valid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  if (!valid) return false;
  const age = Date.now() / 1000 - date.getTime() / 1000;
  return age > 18 * 365.25 * 24 * 3600;
}

export function sanitizeCustomer(input: Partial<Customer>): Customer {
  return {
    name: String(input.name ?? "").trim().slice(0, 120),
    email: String(input.email ?? "").trim().toLowerCase().slice(0, 160),
    phone: onlyDigits(String(input.phone ?? "")).slice(0, 11),
    cpf: onlyDigits(String(input.cpf ?? "")).slice(0, 11),
    birthDate: String(input.birthDate ?? "").trim().slice(0, 10),
  };
}

export function sanitizeAddress(input: Partial<Address>): Address {
  return {
    cep: onlyDigits(String(input.cep ?? "")).slice(0, 8),
    street: String(input.street ?? "").trim().slice(0, 160),
    number: String(input.number ?? "").trim().slice(0, 20),
    complement: String(input.complement ?? "").trim().slice(0, 80),
    district: String(input.district ?? "").trim().slice(0, 120),
    city: String(input.city ?? "").trim().slice(0, 120),
    state: String(input.state ?? "").trim().toUpperCase().slice(0, 2),
  };
}

export function validateCustomer(customer: Customer) {
  const errors: Record<string, string> = {};
  if (customer.name.length < 3) errors.name = "Coloque seu nome completo.";
  if (!isValidEmail(customer.email)) errors.email = "E-mail inválido.";
  if (customer.phone.length < 10) errors.phone = "Telefone com DDD.";
  if (!isValidCpf(customer.cpf)) errors.cpf = "CPF inválido.";
  if (!isValidBirthDate(customer.birthDate)) errors.birthDate = "Data inválida.";
  return errors;
}

export function validateAddress(address: Address) {
  const errors: Record<string, string> = {};
  if (address.cep.length !== 8) errors.cep = "CEP com 8 dígitos.";
  if (address.street.length < 3) errors.street = "Rua obrigatória.";
  if (!address.number) errors.number = "Número obrigatório.";
  if (address.city.length < 2) errors.city = "Cidade obrigatória.";
  if (address.state.length !== 2) errors.state = "UF inválida.";
  return errors;
}

export function validateCard(input: {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}) {
  const errors: Record<string, string> = {};
  const number = onlyDigits(input.number);
  if (number.length < 13 || number.length > 19) errors.number = "Número do cartão inválido.";
  if (!luhn(number)) errors.number = "Número do cartão inválido.";
  if (input.name.trim().length < 3) errors.name = "Nome impresso no cartão.";
  if (!/^\d{2}\/\d{2}$/.test(input.expiry.trim())) errors.expiry = "Validade MM/AA.";
  if (!/^\d{3,4}$/.test(onlyDigits(input.cvv))) errors.cvv = "CVV inválido.";
  return errors;
}

function luhn(digits: string) {
  if (!digits) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function cardBrand(number: string) {
  const digits = onlyDigits(number);
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^6/.test(digits)) return "elo";
  return "cartão";
}

/** server-side price authority: never trust prices sent by the browser */
export function resolveLines(input: CheckoutLine[]) {
  const errors: string[] = [];
  const lines: ResolvedLine[] = [];

  for (const entry of input.slice(0, 40)) {
    const product = allProducts.find((item) => item.handle === entry.handle);
    if (!product) {
      errors.push(`Produto ${entry.handle} não existe.`);
      continue;
    }
    const qty = Math.floor(Number(entry.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    const size = entry.size ?? null;
    if (size && !product.sizes.includes(size)) {
      errors.push(`Tamanho ${size} indisponível em ${product.name}.`);
      continue;
    }
    if (qty > 10) {
      errors.push(`Máximo de 10 unidades por item em ${product.name}.`);
      continue;
    }
    lines.push({
      handle: product.handle,
      name: product.name,
      size,
      qty,
      unitPrice: product.price,
      total: roundMoney(product.price * qty),
    });
  }

  if (lines.length === 0 && errors.length === 0) {
    errors.push("Sacola vazia.");
  }
  return { lines, errors };
}

type Zone = { upTo: number; region: string; factor: number };

/** own shipping table, grouped by CEP range — no external carrier */
const zones: Zone[] = [
  { upTo: 19999, region: "São Paulo / SP", factor: 1 },
  { upTo: 28999, region: "Rio de Janeiro e região / RJ", factor: 1.15 },
  { upTo: 29999, region: "Espírito Santo / ES", factor: 1.3 },
  { upTo: 39999, region: "Minas Gerais / MG", factor: 1.25 },
  { upTo: 48999, region: "Bahia / BA", factor: 1.45 },
  { upTo: 49999, region: "Sergipe / SE", factor: 1.5 },
  { upTo: 58999, region: "Nordeste", factor: 1.6 },
  { upTo: 65999, region: "Ceará e Piauí", factor: 1.7 },
  { upTo: 67999, region: "Norte", factor: 1.9 },
  { upTo: 69999, region: "Amazonas / AM", factor: 2 },
  { upTo: 72999, region: "Distrito Federal / DF", factor: 1.35 },
  { upTo: 76999, region: "Goiás e Tocantins", factor: 1.45 },
  { upTo: 79999, region: "Centro-Oeste", factor: 1.6 },
  { upTo: 87999, region: "Paraná / PR", factor: 1.3 },
  { upTo: 89999, region: "Santa Catarina / SC", factor: 1.4 },
  { upTo: 99999, region: "Rio Grande do Sul / RS", factor: 1.5 },
];

const baseOptions: { id: string; label: string; detail: string; base: number; days: number }[] = [
  { id: "economico", label: "Econômico", detail: "via Correios, rastreado", base: 24.9, days: 6 },
  { id: "expresso", label: "Expresso", detail: "transportadora, rastreado", base: 39.9, days: 3 },
];

export function quoteShipping(cep: string, subtotal: number): ShippingQuote {
  const digits = onlyDigits(cep);
  const prefix = Number(digits.slice(0, 5));
  const zone = zones.find((item) => prefix <= item.upTo) ?? zones[zones.length - 1];
  const freeShipping = subtotal >= brand.freeShippingFrom;

  const options = baseOptions.map((option) => {
    const days = option.days + Math.round((zone.factor - 1) * 5);
    return {
      id: option.id,
      label: option.label,
      detail: option.detail,
      price: freeShipping ? 0 : roundMoney(option.base * zone.factor),
      days,
    } satisfies ShippingOption;
  });

  return {
    cep: digits,
    region: zone.region,
    freeShipping,
    options,
  };
}

export function findShippingOption(quote: ShippingQuote, id: string) {
  return quote.options.find((option) => option.id === id) ?? null;
}

export function computeTotals({
  lines,
  shipping,
  payment,
}: {
  lines: ResolvedLine[];
  shipping: ShippingOption | null;
  payment: PaymentMethod;
}): OrderTotals {
  const subtotal = roundMoney(lines.reduce((total, line) => total + line.total, 0));
  const discount = payment === "pix" ? roundMoney(subtotal * brand.pixDiscount) : 0;
  const shippingPrice = shipping?.price ?? 0;
  const total = roundMoney(subtotal - discount + shippingPrice);
  const installments = roundMoney(total / 3);
  return {
    subtotal,
    discount,
    shipping: shippingPrice,
    total,
    installments,
    freeShipping: subtotal >= brand.freeShippingFrom,
  };
}

export function createOrderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `NV-${suffix}`;
}

/**
 * Builds a structurally valid EMV/BR Code string for the Pix screen.
 * Demo only: the key is a fictional mailbox, so the code cannot be paid.
 */
export function buildPixPayload({
  amount,
  reference,
}: {
  amount: number;
  reference: string;
}) {
  const tlv = (id: string, value: string) => {
    const length = value.length.toString().padStart(2, "0");
    return `${id}${length}${value}`;
  };

  const merchantAccount =
    tlv("00", "br.gov.bcb.pix") + tlv("01", brand.email) + tlv("02", reference);

  const payload =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("26", merchantAccount) +
    tlv("52", "5651") +
    tlv("53", "986") +
    tlv("54", amount.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", brand.name.replace(/[^A-Z0-9 ]/gi, "").toUpperCase().slice(0, 25)) +
    tlv("60", "SAO PAULO") +
    tlv("62", tlv("05", reference.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 25)));

  return `${payload}6304${crc16(payload + "6304")}`;
}

function crc16(value: string) {
  let crc = 0xffff;
  for (let i = 0; i < value.length; i += 1) {
    crc ^= value.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function maskAddressForPublic(address: Address) {
  return {
    ...address,
    street: address.street,
    number: address.number,
    cep: maskCep(address.cep),
  };
}

export function maskCep(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export type PublicOrder = {
  code: string;
  status: string;
  paymentMethod: string;
  customer: Customer;
  address: Address;
  shipping: ShippingOption;
  subtotal: number;
  discount: number;
  shippingPrice: number;
  total: number;
  installments: number;
  pixCode: string | null;
  createdAt: string;
  items: ResolvedLine[];
  storage: string;
};

/** never leak the raw CPF or CEP outside the order screen */
export function toPublicOrder<T extends { customer: Customer; address: Address }>(
  order: T,
  storage: string
) {
  return {
    ...order,
    customer: { ...order.customer, cpf: maskCpf(order.customer.cpf) },
    address: { ...order.address, cep: maskCep(order.address.cep) },
    storage,
  };
}

export const orderStorageKey = (code: string) => `nullvoid-pedido-${code}`;