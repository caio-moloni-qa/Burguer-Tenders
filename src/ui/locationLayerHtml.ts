import { listStoresForCountry, resolveStoreForDelivery } from "../data/stores";
import {
  getLocationLookupError,
  getLocationLookupLoading,
  locationDelivery,
} from "../location/location";
import { escapeHtml } from "./cartHtml";

/** Builds the stores block HTML (title + list) for a given country code. */
export function buildStoresBlockHtml(countryCode: string): string {
  const storesHere = listStoresForCountry(countryCode);
  const storeListItems = storesHere
    .map((s) => {
      const areas = s.serviceAreas.map((a) => `${a.city}, ${a.state}`).join(" · ");
      return `<li class="location-drawer__store-item"><span class="location-drawer__store-item-name">${escapeHtml(s.displayName)}</span><span class="location-drawer__store-item-area">${escapeHtml(areas)}</span></li>`;
    })
    .join("");
  return `
    <p class="location-drawer__stores-title">Stores (${countryCode === "BR" ? "Brazil" : "United States"})</p>
    <ul class="location-drawer__store-list">${storeListItems}</ul>
  `;
}

/** Re-usable — builds just the store-status paragraph HTML from current delivery state. */
export function buildStoreStatusHtml(d: {
  countryCode: string;
  city: string;
  state: string;
}): string {
  const resolved = resolveStoreForDelivery(d);
  const hasCityState = d.city.trim().length > 0 && d.state.trim().length > 0;
  if (resolved) {
    return `<p class="location-drawer__store-status location-drawer__store-status--ok" data-testid="location-store-status">Delivery available from <strong>${escapeHtml(resolved.displayName)}</strong></p>`;
  }
  if (hasCityState) {
    return `<p class="location-drawer__store-status location-drawer__store-status--bad" role="status" data-testid="location-store-status">We don't deliver to this city yet. Try another ZIP in the areas listed below.</p>`;
  }
  return `<p class="location-drawer__store-status location-drawer__store-status--hint" data-testid="location-store-status">Enter your ZIP and use <strong>Look up address</strong> to see if we deliver to you.</p>`;
}

export function renderLocationLayer(open: boolean): string {
  const d = locationDelivery;
  const loading = getLocationLookupLoading();
  const lookupErr = getLocationLookupError();

  const usSel = d.countryCode === "US" ? "selected" : "";
  const brSel = d.countryCode === "BR" ? "selected" : "";

  const errBlock = lookupErr
    ? `<p class="location-drawer__error" role="alert" data-testid="location-lookup-error">${escapeHtml(lookupErr)}</p>`
    : "";

  const storeStatusBlock = buildStoreStatusHtml(d);

  return `
    <div class="location-layer" aria-hidden="${!open}" data-location-open="${open}">
      <button type="button" class="location-backdrop" data-action="close-location" aria-label="Close location" tabindex="${open ? 0 : -1}"></button>
      <aside
        class="location-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-drawer-title"
        data-testid="location-panel"
      >
        <div class="location-drawer__head">
          <h2 id="location-drawer-title" class="location-drawer__title">Your location</h2>
          <button type="button" class="location-drawer__close" data-action="close-location" aria-label="Close">&times;</button>
        </div>
        <div class="location-drawer__body">
          <p class="location-drawer__intro">
            Choose country and postal code, then look up your address (Brazil: ViaCEP; US &amp; others: OpenStreetMap — no API key). You can edit every field before saving. We only deliver where a store serves your city.
          </p>
          <div class="location-drawer__stores" data-testid="location-stores-list">
            ${buildStoresBlockHtml(d.countryCode)}
          </div>
          ${storeStatusBlock}
          <label class="location-label" for="location-country">Country</label>
          <select
            class="location-input location-select"
            id="location-country"
            name="countryCode"
            autocomplete="country"
            data-location-field="countryCode"
            data-testid="location-country"
          >
            <option value="US" ${usSel}>United States</option>
            <option value="BR" ${brSel}>Brazil</option>
          </select>
          <div class="location-zip-row">
            <div class="location-zip-row__field">
              <label class="location-label" for="location-zip">ZIP / Postal code</label>
              <input
                class="location-input"
                id="location-zip"
                name="locationZip"
                type="text"
                inputmode="numeric"
                autocomplete="postal-code"
                data-location-field="zipCode"
                data-testid="location-zip"
                value="${escapeHtml(d.zipCode)}"
              />
            </div>
            <button
              type="button"
              class="location-lookup-btn"
              data-action="lookup-address"
              data-testid="location-lookup"
              ${loading ? "disabled" : ""}
            >
              ${loading
              ? `<span class="location-lookup-btn__spinner" aria-hidden="true"></span><span class="sr-only">Looking up…</span>`
              : "Look up address"}
            </button>
          </div>
          ${errBlock}
          <label class="location-label" for="location-street">Street address</label>
          <input
            class="location-input"
            id="location-street"
            name="streetLine"
            type="text"
            autocomplete="street-address"
            placeholder="Street number and name"
            data-location-field="streetLine"
            data-testid="location-street"
            value="${escapeHtml(d.streetLine)}"
          />
          <label class="location-label" for="location-neighborhood">Neighborhood</label>
          <input
            class="location-input"
            id="location-neighborhood"
            name="neighborhood"
            type="text"
            data-location-field="neighborhood"
            data-testid="location-neighborhood"
            value="${escapeHtml(d.neighborhood)}"
          />
          <div class="location-two-col">
            <div>
              <label class="location-label" for="location-city">City</label>
              <input
                class="location-input"
                id="location-city"
                name="city"
                type="text"
                autocomplete="address-level2"
                data-location-field="city"
                data-testid="location-city"
                value="${escapeHtml(d.city)}"
              />
            </div>
            <div>
              <label class="location-label" for="location-state">State / Province</label>
              <input
                class="location-input"
                id="location-state"
                name="state"
                type="text"
                autocomplete="address-level1"
                data-location-field="state"
                data-testid="location-state"
                value="${escapeHtml(d.state)}"
              />
            </div>
          </div>
          <label class="location-label" for="location-country-name">Country (from lookup)</label>
          <input
            class="location-input"
            id="location-country-name"
            name="countryName"
            type="text"
            autocomplete="country-name"
            data-location-field="country"
            data-testid="location-country-name"
            value="${escapeHtml(d.country)}"
          />
          <label class="location-label" for="location-complement">Complement</label>
          <input
            class="location-input"
            id="location-complement"
            name="locationComplement"
            type="text"
            autocomplete="address-line2"
            placeholder="Apt, floor, reference…"
            data-location-field="complement"
            data-testid="location-complement"
            value="${escapeHtml(d.complement)}"
          />
        </div>
        <div class="location-drawer__foot">
          <button type="button" class="location-drawer__save" data-action="save-location" data-testid="location-save"
            ${loading ? "disabled" : ""}
          >
            ${loading
              ? `<span class="location-lookup-btn__spinner" aria-hidden="true"></span><span class="sr-only">Saving…</span>`
              : "Save location"}
          </button>
        </div>
      </aside>
    </div>
  `;
}
