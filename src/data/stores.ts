import type { StoreDefinition } from "../types/store";

export const STORES: readonly StoreDefinition[] = [
  {
    id: "br-londrina-higienopolis",
    displayName: "Burguer-Tenders Higienopolis",
    countryCode: "BR",
    serviceAreas: [{ city: "Londrina", state: "PR" }],
  },
  {
    id: "br-sp-pinheiros",
    displayName: "Burguer-Tenders Pinheiros",
    countryCode: "BR",
    serviceAreas: [{ city: "São Paulo", state: "SP" }],
  },
  {
    id: "us-ny-midtown",
    displayName: "Burguer-Tenders Midtown",
    countryCode: "US",
    serviceAreas: [{ city: "New York", state: "NY" }],
  },
];

function normalizeCity(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Nominatim may return "NY" or "New York" for US. */
const US_STATE_NAME_TO_CODE: Record<string, string> = {
  "new york": "NY",
  california: "CA",
  texas: "TX",
  florida: "FL",
  illinois: "IL",
};

function canonicalState(countryCode: string, state: string): string {
  const t = state.trim();
  if (!t) {
    return "";
  }
  if (countryCode === "US") {
    if (/^[A-Za-z]{2}$/.test(t)) {
      return t.toUpperCase();
    }
    const fromName = US_STATE_NAME_TO_CODE[t.toLowerCase().replace(/\s+/g, " ")];
    return fromName ?? "";
  }
  return t.toUpperCase().slice(0, 2);
}

export function listStoresForCountry(countryCode: string): StoreDefinition[] {
  const cc = countryCode.toUpperCase().slice(0, 2);
  return STORES.filter((s) => s.countryCode === cc);
}

export function getStoreById(id: string): StoreDefinition | undefined {
  return STORES.find((s) => s.id === id);
}

/**
 * Pick the store that serves this address (same city + state as a service area).
 */
export function resolveStoreForDelivery(d: {
  countryCode: string;
  city: string;
  state: string;
}): StoreDefinition | null {
  const cc = d.countryCode.toUpperCase().slice(0, 2);
  const cityN = normalizeCity(d.city);
  const stateRemote = canonicalState(cc, d.state);
  if (!cityN || !stateRemote) {
    return null;
  }
  for (const store of STORES) {
    if (store.countryCode !== cc) {
      continue;
    }
    for (const area of store.serviceAreas) {
      const stateArea = canonicalState(cc, area.state);
      if (normalizeCity(area.city) === cityN && stateArea === stateRemote) {
        return store;
      }
    }
  }
  return null;
}

export function getStoreDisplayName(storeId: string): string {
  const s = getStoreById(storeId);
  return s?.displayName ?? "";
}
