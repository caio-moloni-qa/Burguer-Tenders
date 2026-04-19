import { getStoreDisplayName } from "../data/stores";
import { locationDelivery } from "../location/location";
import { escapeHtml } from "./cartHtml";
import { renderHeaderBrand } from "./headerBrandHtml";

export function renderConfirmationView(
  container: HTMLDivElement,
  userName: string
): void {
  const d = locationDelivery;
  const cityState = [d.city, d.state].filter(Boolean).join(", ");
  const storeName = d.storeId ? getStoreDisplayName(d.storeId) : "";

  function roRow(label: string, value: string): string {
    if (!value.trim()) {
      return "";
    }
    return `
      <div class="confirm-address__row">
        <span class="confirm-address__label">${escapeHtml(label)}</span>
        <span class="confirm-address__value">${escapeHtml(value)}</span>
      </div>`;
  }

  container.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner site-header__inner--bar">
        ${renderHeaderBrand()}
      </div>
    </header>
    <main class="confirm-page" data-testid="confirmation-page">
      <div class="confirm-card">

        <div class="confirm-card__hero">
          <svg class="confirm-card__check" viewBox="0 0 52 52" aria-hidden="true">
            <circle class="confirm-card__check-circle" cx="26" cy="26" r="24" fill="none"/>
            <path class="confirm-card__check-tick" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M14 27l9 9 16-18"/>
          </svg>
        </div>

        <h1 class="confirm-card__title" data-testid="confirm-title">
          Thank you, ${escapeHtml(userName)}!
        </h1>
        <p class="confirm-card__subtitle">Your order is placed!</p>

        <div class="confirm-card__eta" data-testid="confirm-eta">
          <img
            src="/images/clock-icon-white.svg"
            alt=""
            width="28"
            height="28"
            class="confirm-card__eta-icon"
          />
          <span>Estimated delivery: <strong>30 min</strong></span>
        </div>

        <div class="confirm-address" data-testid="confirm-address">
          <h2 class="confirm-address__heading">Delivery address</h2>
          ${storeName ? `<p class="confirm-address__store">${escapeHtml(storeName)}</p>` : ""}
          ${roRow("ZIP / Postal code",  d.zipCode)}
          ${roRow("Street address",     d.streetLine)}
          ${roRow("Neighborhood",       d.neighborhood)}
          ${roRow("City / State",       cityState)}
          ${roRow("Country",            d.country)}
          ${roRow("Complement",         d.complement)}
        </div>

        <button
          type="button"
          class="confirm-card__back"
          data-action="go-home"
          data-testid="confirm-back"
        >
          Back to menu
        </button>

      </div>
    </main>
  `;
}
