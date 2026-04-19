/**
 * ViaCEP — official Brazilian postal code lookup (free, no API key).
 * @see https://viacep.com.br/
 */

export async function lookupViaCep(eightDigits) {
  const digits = String(eightDigits || "").replace(/\D/g, "");
  if (digits.length !== 8) {
    return null;
  }

  const url = `https://viacep.com.br/ws/${digits}/json/`;
  const r = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BurguerTenders-Training/1.0",
    },
  });

  if (!r.ok) {
    return null;
  }

  const data = await r.json();
  if (!data || data.erro === true) {
    return null;
  }

  const cep = typeof data.cep === "string" ? data.cep : "";
  return {
    streetLine: typeof data.logradouro === "string" ? data.logradouro.trim() : "",
    neighborhood: typeof data.bairro === "string" ? data.bairro.trim() : "",
    city: typeof data.localidade === "string" ? data.localidade.trim() : "",
    state: typeof data.uf === "string" ? data.uf.trim() : "",
    country: "Brazil",
    zipCode: cep || `${digits.slice(0, 5)}-${digits.slice(5)}`,
  };
}
