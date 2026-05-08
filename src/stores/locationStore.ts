import { create } from "zustand";
import { resolveStoreForDelivery } from "../data/stores";

/** Persistable shape of a delivery location (matches `DeliveryPayload` from the API). */
export type LocationDelivery = {
  zipCode: string;
  countryCode: string;
  streetLine: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  complement: string;
  /** Resolved fulfilling store id (empty when no store can serve the city). */
  storeId: string;
};

const emptyDelivery = (): LocationDelivery => ({
  zipCode: "",
  countryCode: "US",
  streetLine: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "",
  complement: "",
  storeId: "",
});

type LocationState = {
  delivery: LocationDelivery;
  /** True only after a successful GET (hydrate) or POST (save). */
  syncedWithServer: boolean;
  panelOpen: boolean;
  lookupLoading: boolean;
  lookupError: string;

  setField: <K extends keyof LocationDelivery>(field: K, value: LocationDelivery[K]) => void;
  setDeliveryFromServer: (data: Partial<LocationDelivery> & { zipCode: string }) => void;
  applyGeocoded: (data: {
    streetLine: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  }) => void;

  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  setLookupLoading: (loading: boolean) => void;
  setLookupError: (error: string) => void;
  clearLookupError: () => void;
};

function withResolvedStore(d: LocationDelivery): LocationDelivery {
  const match = resolveStoreForDelivery({
    countryCode: d.countryCode,
    city: d.city,
    state: d.state,
  });
  const storeId = match?.id ?? "";
  if (storeId === d.storeId) {
    return d;
  }
  return { ...d, storeId };
}

export const useLocationStore = create<LocationState>((set) => ({
  delivery: emptyDelivery(),
  syncedWithServer: false,
  panelOpen: false,
  lookupLoading: false,
  lookupError: "",

  setField: (field, value) =>
    set((state) => {
      const nextDelivery = withResolvedStore({ ...state.delivery, [field]: value });
      return {
        delivery: nextDelivery,
        // Any edit invalidates the synced flag until the user saves again.
        syncedWithServer: false,
        // Typing implicitly clears the previous lookup error.
        lookupError: "",
      };
    }),

  setDeliveryFromServer: (data) =>
    set((state) => {
      const next: LocationDelivery = { ...state.delivery, ...data };
      return { delivery: withResolvedStore(next), syncedWithServer: true };
    }),

  applyGeocoded: (data) =>
    set((state) => {
      const next: LocationDelivery = {
        ...state.delivery,
        streetLine: data.streetLine,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode || state.delivery.zipCode,
      };
      return { delivery: withResolvedStore(next), syncedWithServer: false };
    }),

  openPanel: () => set({ panelOpen: true, lookupError: "" }),
  closePanel: () =>
    set({ panelOpen: false, lookupLoading: false, lookupError: "" }),
  togglePanel: () =>
    set((s) =>
      s.panelOpen
        ? { panelOpen: false, lookupLoading: false, lookupError: "" }
        : { panelOpen: true, lookupError: "" }
    ),

  setLookupLoading: (loading) => set({ lookupLoading: loading }),
  setLookupError: (error) => set({ lookupError: error }),
  clearLookupError: () => set({ lookupError: "" }),
}));

// ─── Derived selectors ────────────────────────────────────────────────────────

export function selectHasDeliveryLocation(state: {
  delivery: LocationDelivery;
  syncedWithServer: boolean;
}): boolean {
  return (
    state.syncedWithServer &&
    state.delivery.zipCode.trim().length > 0 &&
    state.delivery.storeId.trim().length > 0
  );
}

export function selectLocationSummary(state: { delivery: LocationDelivery }): string {
  const d = state.delivery;
  const z = d.zipCode.trim();
  if (!z) {
    return "";
  }
  const city = d.city.trim();
  const st = d.state.trim();
  if (city || st) {
    return [city, st, z].filter(Boolean).join(", ");
  }
  const line = d.streetLine.trim();
  if (line) {
    return `${line} · ${z}`;
  }
  const c = d.complement.trim();
  return c ? `${z} · ${c}` : z;
}
