import type { CartStore } from "../cart/cartStore";
import { checkoutValidationErrors } from "../checkout/checkoutErrors";
import { checkoutForm } from "../checkout/checkoutForm";
import { getProductById } from "../data/products";
import { getLocationPanelOpen, locationDelivery } from "../location/location";
import { getStoreDisplayName } from "../data/stores";
import {
  cartSubtotal,
  escapeHtml,
  formatPrice,
  renderCartDrawerFoot,
  renderCartLines,
} from "./cartHtml";
import { renderHeaderBrand } from "./headerBrandHtml";
import { renderHeaderActionsBar } from "./headerActionsHtml";
import { renderLocationLayer } from "./locationLayerHtml";

function ve(field: string): string {
  return checkoutValidationErrors[field] ?? "";
}

function errClass(field: string): string {
  return ve(field) ? "checkout-input checkout-input--invalid" : "checkout-input";
}

function errBlock(field: string, id: string): string {
  const msg = ve(field);
  if (!msg) {
    return "";
  }
  return `<p id="${id}" class="checkout-field-error" role="alert" data-testid="checkout-error-${field}">${escapeHtml(msg)}</p>`;
}

export function renderCheckoutView(container: HTMLDivElement, cart: CartStore): void {
  const drawerOpen = cart.isDrawerOpen();
  const subtotal = cartSubtotal(cart);
  const f = checkoutForm;

  const locationOpen = getLocationPanelOpen();
  document.body.classList.toggle("cart-open", drawerOpen || locationOpen);

  const paymentCardChecked = f.paymentMethod === "card" ? "checked" : "";
  const paymentRestaurantChecked = f.paymentMethod === "pay-in-restaurant" ? "checked" : "";
  const showCardFields = f.paymentMethod === "card";

  const zipValue =
    f.zipCode.trim() !== "" ? f.zipCode : locationDelivery.zipCode;

  const d = locationDelivery;
  const cityState = [d.city, d.state].filter(Boolean).join(", ");
  const storeName = d.storeId ? getStoreDisplayName(d.storeId) : "";

  function roField(id: string, label: string, value: string, testId: string): string {
    return `
      <label class="checkout-label checkout-label--readonly" for="${id}">${escapeHtml(label)}</label>
      <input
        class="checkout-input checkout-input--readonly"
        id="${id}"
        type="text"
        readonly
        tabindex="-1"
        data-testid="${testId}"
        value="${escapeHtml(value)}"
      />`;
  }

  container.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner site-header__inner--bar">
        ${renderHeaderBrand()}
        ${renderHeaderActionsBar(cart, locationOpen)}
      </div>
    </header>
    <main class="checkout-page" data-testid="checkout-page">
      <div class="checkout-page__inner">
        <button type="button" class="checkout-back" data-action="back-to-shop" data-testid="back-to-shop">
          ← Back to menu
        </button>
        <h2 class="checkout-page__title">Checkout</h2>
        <form class="checkout-form" id="checkout-form" data-testid="checkout-form" novalidate>
          <fieldset class="checkout-fieldset">
            <legend class="checkout-fieldset__legend">Your details</legend>
            <label class="checkout-label" for="checkout-name">Name</label>
            <input
              class="${errClass("fullName")}"
              id="checkout-name"
              name="fullName"
              type="text"
              autocomplete="name"
              data-checkout-field="fullName"
              data-testid="checkout-name"
              aria-invalid="${ve("fullName") ? "true" : "false"}"
              ${ve("fullName") ? 'aria-describedby="checkout-name-error"' : ""}
              value="${escapeHtml(f.fullName)}"
            />
            ${errBlock("fullName", "checkout-name-error")}
            <label class="checkout-label" for="checkout-email">Email</label>
            <input
              class="${errClass("email")}"
              id="checkout-email"
              name="email"
              type="email"
              autocomplete="email"
              data-checkout-field="email"
              data-testid="checkout-email"
              aria-invalid="${ve("email") ? "true" : "false"}"
              ${ve("email") ? 'aria-describedby="checkout-email-error"' : ""}
              value="${escapeHtml(f.email)}"
            />
            ${errBlock("email", "checkout-email-error")}
          </fieldset>
          <fieldset class="checkout-fieldset">
            <legend class="checkout-fieldset__legend">Delivery address</legend>
            ${storeName ? `<p class="checkout-delivery__store" data-testid="checkout-store-name">${escapeHtml(storeName)}</p>` : ""}
            ${roField("checkout-zip",          "ZIP / Postal code",   zipValue,       "checkout-zip")}
            ${roField("checkout-street",       "Street address",      d.streetLine,   "checkout-street")}
            ${roField("checkout-neighborhood", "Neighborhood",        d.neighborhood, "checkout-neighborhood")}
            ${roField("checkout-city-state",   "City / State",        cityState,      "checkout-city-state")}
            ${roField("checkout-country",      "Country",             d.country,      "checkout-country")}
            ${d.complement.trim() ? roField("checkout-complement", "Complement", d.complement, "checkout-complement") : ""}
          </fieldset>
          <fieldset class="checkout-fieldset">
            <legend class="checkout-fieldset__legend">Payment</legend>
            <div class="checkout-radios" role="radiogroup" aria-label="Payment method">
              <label class="checkout-radio">
                <input
                  type="radio"
                  name="payment-method"
                  value="card"
                  ${paymentCardChecked}
                  data-checkout-payment
                  data-testid="payment-card"
                />
                <span>Credit/debit card</span>
              </label>
              <label class="checkout-radio">
                <input
                  type="radio"
                  name="payment-method"
                  value="pay-in-restaurant"
                  ${paymentRestaurantChecked}
                  data-checkout-payment
                  data-testid="payment-restaurant"
                />
                <span>Pay in restaurant</span>
              </label>
            </div>
            <div
              class="checkout-card-fields"
              data-testid="card-details"
              ${showCardFields ? "" : "hidden"}
            >
              <p class="checkout-card-fields__hint">Card details</p>
              <label class="checkout-label" for="checkout-card-name">Name on card</label>
              <input
                class="${errClass("cardNameOnCard")}"
                id="checkout-card-name"
                name="cardNameOnCard"
                type="text"
                autocomplete="cc-name"
                data-checkout-field="cardNameOnCard"
                data-testid="checkout-card-name"
                aria-invalid="${ve("cardNameOnCard") ? "true" : "false"}"
                ${ve("cardNameOnCard") ? 'aria-describedby="checkout-card-name-error"' : ""}
                value="${escapeHtml(f.cardNameOnCard)}"
              />
              ${errBlock("cardNameOnCard", "checkout-card-name-error")}
              <label class="checkout-label" for="checkout-card-number">Card number</label>
              <input
                class="${errClass("cardNumber")}"
                id="checkout-card-number"
                name="cardNumber"
                type="text"
                inputmode="numeric"
                autocomplete="cc-number"
                placeholder="1234 5678 9012 3456"
                maxlength="23"
                data-checkout-field="cardNumber"
                data-testid="checkout-card-number"
                aria-invalid="${ve("cardNumber") ? "true" : "false"}"
                ${ve("cardNumber") ? 'aria-describedby="checkout-card-number-error"' : ""}
                value="${escapeHtml(f.cardNumber)}"
              />
              ${errBlock("cardNumber", "checkout-card-number-error")}
              <div class="checkout-card-row">
                <div class="checkout-card-row__field">
                  <label class="checkout-label" for="checkout-card-expiry">Expiry</label>
                  <input
                    class="${errClass("cardExpiry")}"
                    id="checkout-card-expiry"
                    name="cardExpiry"
                    type="text"
                    inputmode="numeric"
                    autocomplete="cc-exp"
                    placeholder="MM / YY"
                    maxlength="7"
                    pattern="\d{2} / \d{2}"
                    data-checkout-field="cardExpiry"
                    data-testid="checkout-card-expiry"
                    aria-invalid="${ve("cardExpiry") ? "true" : "false"}"
                    ${ve("cardExpiry") ? 'aria-describedby="checkout-card-expiry-error"' : ""}
                    value="${escapeHtml(f.cardExpiry)}"
                  />
                  ${errBlock("cardExpiry", "checkout-card-expiry-error")}
                </div>
                <div class="checkout-card-row__field">
                  <label class="checkout-label" for="checkout-card-cvc">Security code</label>
                  <input
                    class="${errClass("cardCvc")}"
                    id="checkout-card-cvc"
                    name="cardCvc"
                    type="password"
                    inputmode="numeric"
                    autocomplete="cc-csc"
                    placeholder="CVC"
                    maxlength="4"
                    pattern="\d{3,4}"
                    data-checkout-field="cardCvc"
                    data-testid="checkout-card-cvc"
                    aria-invalid="${ve("cardCvc") ? "true" : "false"}"
                    ${ve("cardCvc") ? 'aria-describedby="checkout-card-cvc-error"' : ""}
                    value="${escapeHtml(f.cardCvc)}"
                  />
                  ${errBlock("cardCvc", "checkout-card-cvc-error")}
                </div>
              </div>
            </div>
          </fieldset>
          <section class="checkout-summary" aria-labelledby="checkout-summary-title">
            <h3 id="checkout-summary-title" class="checkout-summary__title">Order summary</h3>
            <div class="checkout-summary__lines" data-testid="checkout-summary-lines">
              ${renderOrderSummary(cart)}
            </div>
            <div class="checkout-summary__total">
              <span>Subtotal</span>
              <strong data-testid="checkout-subtotal">${formatPrice(subtotal)}</strong>
            </div>
          </section>
          <button type="submit" class="checkout-submit" data-testid="place-order">
            Place order
          </button>
        </form>
      </div>
    </main>
    <div class="cart-layer" aria-hidden="${!drawerOpen}" data-cart-open="${drawerOpen}">
      <button type="button" class="cart-backdrop" data-action="close-cart" aria-label="Close cart" tabindex="${drawerOpen ? 0 : -1}"></button>
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" data-testid="cart-drawer">
        <div class="cart-drawer__head">
          <h2 id="cart-drawer-title" class="cart-drawer__title">Cart</h2>
          <button type="button" class="cart-drawer__close" data-action="close-cart" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer__body">
          ${renderCartLines(cart)}
        </div>
        ${renderCartDrawerFoot(cart)}
      </aside>
    </div>
    ${renderLocationLayer(locationOpen)}
  `;
}

function renderOrderSummary(cart: CartStore): string {
  const lines = cart.getLines();
  if (lines.length === 0) {
    return '<p class="checkout-summary__empty">No items in cart.</p>';
  }
  return `<ul class="checkout-order-lines">
    ${lines
      .map((line) => {
        const product = getProductById(line.productId);
        if (!product) {
          return "";
        }
        const lineTotal = product.priceUsd * line.quantity;
        return `<li class="checkout-order-line">
          <span>${escapeHtml(product.shortName)} × ${line.quantity}</span>
          <span>${formatPrice(lineTotal)}</span>
        </li>`;
      })
      .join("")}
  </ul>`;
}
