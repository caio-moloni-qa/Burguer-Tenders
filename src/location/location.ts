/** Delivery area — draft while typing; persisted on server after Save. */
export const locationDelivery = {
  zipCode: "",
  countryCode: "US",
  streetLine: "",
  neighborhood: "",
  city: "",
  state: "",
  country: "",
  complement: "",
  /** Set from resolved {@link syncResolvedStoreFromAddress}; persisted with delivery. */
  storeId: "",
};

import { resolveStoreForDelivery } from "../data/stores";

/** True only after successful GET (hydrate) or POST (save). Editing fields clears this until saved again. */
let deliverySyncedWithServer = false;

let panelOpen = false;
const listeners = new Set<() => void>();

let lookupLoading = false;
let lookupError = "";

function emit(): void {
  listeners.forEach((fn) => fn());
}

export function getLocationPanelOpen(): boolean {
  return panelOpen;
}

export function getLocationLookupLoading(): boolean {
  return lookupLoading;
}

export function getLocationLookupError(): string {
  return lookupError;
}

export function setLocationLookupState(opts: { loading?: boolean; error?: string }): void {
  if (opts.loading !== undefined) {
    lookupLoading = opts.loading;
  }
  if (opts.error !== undefined) {
    lookupError = opts.error;
  }
  emit();
}

/** Clear the lookup error in memory without triggering a re-render. */
export function clearLookupErrorSilent(): void {
  lookupError = "";
}

/** Set loading=true silently (no re-render). */
export function lookupLoadingStart(): void {
  lookupLoading = true;
  lookupError = "";
}

/** Set loading=false silently (no re-render). */
export function lookupLoadingEnd(): void {
  lookupLoading = false;
}

/** Force subscribers to re-render (use after meaningful state changes, not on every keystroke). */
export function emitLocationChange(): void {
  emit();
}

export function toggleLocationPanel(): void {
  panelOpen = !panelOpen;
  if (panelOpen) {
    lookupError = "";
  }
  emit();
}

export function openLocationPanel(): void {
  if (!panelOpen) {
    lookupError = "";
    panelOpen = true;
    emit();
  }
}

export function closeLocationPanel(): void {
  panelOpen = false;
  lookupLoading = false;
  lookupError = "";
  emit();
}

export function subscribeLocation(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function markDeliveryUnsaved(): void {
  deliverySyncedWithServer = false;
}

/** Recompute {@link locationDelivery.storeId} from city/state/ZIP (no emit). */
export function syncResolvedStoreFromAddress(): void {
  const match = resolveStoreForDelivery({
    countryCode: locationDelivery.countryCode,
    city: locationDelivery.city,
    state: locationDelivery.state,
  });
  locationDelivery.storeId = match?.id ?? "";
}

export function markDeliverySynced(): void {
  deliverySyncedWithServer = true;
}

export function setDeliveryFromServer(data: {
  zipCode: string;
  countryCode?: string;
  streetLine?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  complement?: string;
  storeId?: string;
}): void {
  locationDelivery.zipCode = data.zipCode;
  if (data.countryCode != null) {
    locationDelivery.countryCode = data.countryCode;
  }
  if (data.streetLine != null) {
    locationDelivery.streetLine = data.streetLine;
  }
  if (data.neighborhood != null) {
    locationDelivery.neighborhood = data.neighborhood;
  }
  if (data.city != null) {
    locationDelivery.city = data.city;
  }
  if (data.state != null) {
    locationDelivery.state = data.state;
  }
  if (data.country != null) {
    locationDelivery.country = data.country;
  }
  if (data.complement != null) {
    locationDelivery.complement = data.complement;
  }
  if (data.storeId != null && typeof data.storeId === "string" && data.storeId.trim()) {
    locationDelivery.storeId = data.storeId.trim();
  }
}

export function hasDeliveryLocation(): boolean {
  return (
    deliverySyncedWithServer &&
    locationDelivery.zipCode.trim().length > 0 &&
    locationDelivery.storeId.trim().length > 0
  );
}

export function formatLocationSummary(): string {
  const z = locationDelivery.zipCode.trim();
  if (!z) {
    return "";
  }
  const city = locationDelivery.city.trim();
  const st = locationDelivery.state.trim();
  const line = locationDelivery.streetLine.trim();
  if (city || st) {
    const parts = [city, st, z].filter(Boolean);
    return parts.join(", ");
  }
  if (line) {
    return `${line} · ${z}`;
  }
  const c = locationDelivery.complement.trim();
  return c ? `${z} · ${c}` : z;
}
