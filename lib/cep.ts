export type CepAddress = {
  street: string;
  district: string;
  city: string;
  state: string;
};

type Normalized = CepAddress | null;

async function fetchJson(url: string, timeoutMs: number) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.warn("[cep] falhou:", url.split("/").pop(), (error as Error).message);
    return null;
  }
}

async function viaCep(cep: string): Promise<Normalized> {
  const data = await fetchJson(`https://viacep.com.br/ws/${cep}/json/`, 6000);
  if (!data || data.erro) return null;
  return {
    street: String(data.logradouro ?? ""),
    district: String(data.bairro ?? ""),
    city: String(data.localidade ?? ""),
    state: String(data.uf ?? ""),
  };
}

async function brasilApi(cep: string): Promise<Normalized> {
  const data = await fetchJson(`https://brasilapi.com.br/api/cep/v1/${cep}`, 6000);
  if (!data || data.errors) return null;
  return {
    street: String(data.street ?? ""),
    district: String(data.neighborhood ?? ""),
    city: String(data.city ?? ""),
    state: String(data.state ?? ""),
  };
}

/**
 * Best-effort: two free sources in a row. If both fail the checkout still works,
 * the customer just types the address by hand.
 */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D+/g, "");
  if (digits.length !== 8) return null;
  const found = (await viaCep(digits)) ?? (await brasilApi(digits));
  if (!found || (!found.city && !found.street)) return null;
  return found;
}