import type { CartStore } from "../cart/cartStore";
import { t } from "../i18n/locale";
import { formatLocationSummary, hasDeliveryLocation } from "../location/location";
import { escapeHtml } from "./cartHtml";

export function renderHeaderActionsBar(
  cart: CartStore,
  locationPanelOpen: boolean
): string {
  const totalItems = cart.getTotalItemCount();
  const drawerOpen = cart.isDrawerOpen();
  const located = hasDeliveryLocation();
  const summary = formatLocationSummary();
  const summaryHtml =
    located && summary
      ? `<span class="header-location__summary" data-testid="location-summary" title="${escapeHtml(summary)}">${escapeHtml(summary)}</span>`
      : "";

  return `
        <div class="header-actions">
          <div class="header-location-group">
          ${summaryHtml}
          <button
            type="button"
            class="header-location"
            data-action="toggle-location"
            aria-label="${locationPanelOpen ? t("headerCloseLocation") : t("headerOpenLocation")}"
            aria-expanded="${locationPanelOpen}"
            data-testid="location-toggle"
          >
            <img
              class="header-location__icon"
              src="/images/pin-icon-white.svg"
              alt=""
              width="46"
              height="46"
              decoding="async"
            />
            <span class="header-location__badge ${located ? "header-location__badge--visible" : ""}" data-testid="location-set-indicator" aria-hidden="${!located}"></span>
          </button>
          </div>
          <button type="button" class="header-cart" data-action="toggle-cart" aria-label="${drawerOpen ? t("headerCloseCart") : t("headerOpenCart")}" aria-expanded="${drawerOpen}" data-testid="cart-toggle">
            <img
              class="header-cart__icon"
              src="/images/cart-icon-white.svg"
              alt=""
              width="46"
              height="46"
              decoding="async"
            />
            <span class="header-cart__badge ${totalItems > 0 ? "header-cart__badge--visible" : ""}" data-testid="cart-count" aria-hidden="${totalItems === 0}">${totalItems}</span>
          </button>
        </div>`;
}
