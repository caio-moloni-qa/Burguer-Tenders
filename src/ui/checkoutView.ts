import type { CartStore } from "../cart/cartStore";
import { checkoutValidationErrors } from "../checkout/checkoutErrors";
import {
  checkoutForm,
  type TipPercent,
  DONATION_ASSOCIATION,
  DONATION_FIXED_OPTIONS,
  DONATION_PERCENT_OPTIONS,
} from "../checkout/checkoutForm";
import { getProductById } from "../data/products";
import { getLocationPanelOpen, locationDelivery } from "../location/location";
import { getStoreDisplayName } from "../data/stores";
import { t } from "../i18n/locale";
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

const TIP_OPTIONS: TipPercent[] = [0, 10, 15, 20];

export function renderCheckoutView(container: HTMLDivElement, cart: CartStore): void {
  const drawerOpen = cart.isDrawerOpen();
  const subtotal = cartSubtotal(cart);
  const f = checkoutForm;
  const tipAmount = subtotal * f.tipPercent / 100;
  const donationAmount =
    f.donationType === "fixed"   ? f.donationAmount :
    f.donationType === "percent" ? subtotal * f.donationAmount / 100 :
    0;
  const grandTotal = subtotal + tipAmount + donationAmount;

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
          ${t("checkoutBackToMenu")}
        </button>
        <h2 class="checkout-page__title">${t("checkoutTitle")}</h2>
        <form class="checkout-form" id="checkout-form" data-testid="checkout-form" novalidate>
          <fieldset class="checkout-fieldset">
            <legend class="checkout-fieldset__legend">${t("checkoutSectionDetails")}</legend>
            <label class="checkout-label" for="checkout-name">${t("checkoutName")}</label>
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
            <label class="checkout-label" for="checkout-email">${t("checkoutEmail")}</label>
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
            <legend class="checkout-fieldset__legend">${t("checkoutSectionDelivery")}</legend>
            ${storeName ? `<p class="checkout-delivery__store" data-testid="checkout-store-name">${escapeHtml(storeName)}</p>` : ""}
            ${roField("checkout-zip",          t("checkoutZip"),          zipValue,       "checkout-zip")}
            ${roField("checkout-street",       t("checkoutStreet"),       d.streetLine,   "checkout-street")}
            ${roField("checkout-neighborhood", t("checkoutNeighborhood"), d.neighborhood, "checkout-neighborhood")}
            ${roField("checkout-city-state",   t("checkoutCityState"),    cityState,      "checkout-city-state")}
            ${roField("checkout-country",      t("checkoutCountry"),      d.country,      "checkout-country")}
            ${d.complement.trim() ? roField("checkout-complement", t("checkoutComplement"), d.complement, "checkout-complement") : ""}
          </fieldset>
          <fieldset class="checkout-fieldset">
            <legend class="checkout-fieldset__legend">${t("checkoutSectionPayment")}</legend>
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
                <span>${t("checkoutPayCard")}</span>
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
                <span>${t("checkoutPayRestaurant")}</span>
              </label>
            </div>
            <div
              class="checkout-card-fields"
              data-testid="card-details"
              ${showCardFields ? "" : "hidden"}
            >
              <p class="checkout-card-fields__hint">${t("checkoutCardDetails")}</p>
              <label class="checkout-label" for="checkout-card-name">${t("checkoutCardName")}</label>
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
              <label class="checkout-label" for="checkout-card-number">${t("checkoutCardNumber")}</label>
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
                  <label class="checkout-label" for="checkout-card-expiry">${t("checkoutExpiry")}</label>
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
                  <label class="checkout-label" for="checkout-card-cvc">${t("checkoutSecurityCode")}</label>
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
            <h3 id="checkout-summary-title" class="checkout-summary__title">${t("checkoutOrderSummary")}</h3>
            <div class="checkout-summary__lines" data-testid="checkout-summary-lines">
              ${renderOrderSummary(cart)}
            </div>
            <div class="checkout-tip" data-testid="checkout-tip-selector">
              <p class="checkout-tip__label">${t("checkoutTip")}</p>
              <div class="checkout-tip__options" role="group" aria-label="${t("checkoutTip")}">
                ${TIP_OPTIONS.map((pct) => `
                  <button
                    type="button"
                    class="checkout-tip__btn${f.tipPercent === pct ? " checkout-tip__btn--active" : ""}"
                    data-action="set-tip"
                    data-tip-percent="${pct}"
                    data-testid="tip-option-${pct}"
                  >${pct === 0 ? t("checkoutTipNone") : `${pct}%`}</button>
                `).join("")}
              </div>
            </div>
            <div class="checkout-donation" data-testid="checkout-donation">
              <p class="checkout-donation__title">
                ${t("checkoutDonation")} <strong>${escapeHtml(DONATION_ASSOCIATION)}</strong>
              </p>
              <div class="checkout-donation__groups">
                <div class="checkout-donation__group">
                  <span class="checkout-donation__group-label">${t("checkoutDonationFixed")}</span>
                  <div class="checkout-donation__options" role="group" aria-label="${t("checkoutDonationFixed")}">
                    ${DONATION_FIXED_OPTIONS.map((amt) => {
                      const active = f.donationType === "fixed" && f.donationAmount === amt && f.donationCustomFixed === "";
                      return `<button
                        type="button"
                        class="checkout-donation__btn${active ? " checkout-donation__btn--active" : ""}"
                        data-action="set-donation"
                        data-donation-type="fixed"
                        data-donation-amount="${amt}"
                        data-testid="donation-fixed-${amt}"
                      >${formatPrice(amt)}</button>`;
                    }).join("")}
                    <div class="checkout-donation__custom-wrap">
                      <input
                        type="number"
                        class="checkout-donation__custom-input${f.donationType === "fixed" && f.donationCustomFixed !== "" ? " checkout-donation__custom-input--active" : ""}"
                        data-donation-custom="fixed"
                        data-testid="donation-custom-fixed"
                        placeholder="${t("checkoutDonationCustom")}"
                        min="0.01"
                        step="0.01"
                        value="${escapeHtml(f.donationCustomFixed)}"
                        aria-label="${t("checkoutDonationFixed")} — ${t("checkoutDonationCustom")}"
                      />
                    </div>
                  </div>
                </div>
                <div class="checkout-donation__group">
                  <span class="checkout-donation__group-label">${t("checkoutDonationPercent")}</span>
                  <div class="checkout-donation__options" role="group" aria-label="${t("checkoutDonationPercent")}">
                    ${DONATION_PERCENT_OPTIONS.map((pct) => {
                      const active = f.donationType === "percent" && f.donationAmount === pct && f.donationCustomPercent === "";
                      return `<button
                        type="button"
                        class="checkout-donation__btn${active ? " checkout-donation__btn--active" : ""}"
                        data-action="set-donation"
                        data-donation-type="percent"
                        data-donation-amount="${pct}"
                        data-testid="donation-percent-${pct}"
                      >${pct}%</button>`;
                    }).join("")}
                    <div class="checkout-donation__custom-wrap checkout-donation__custom-wrap--percent">
                      <input
                        type="number"
                        class="checkout-donation__custom-input${f.donationType === "percent" && f.donationCustomPercent !== "" ? " checkout-donation__custom-input--active" : ""}"
                        data-donation-custom="percent"
                        data-testid="donation-custom-percent"
                        placeholder="${t("checkoutDonationCustom")}"
                        min="0.01"
                        max="100"
                        step="0.01"
                        value="${escapeHtml(f.donationCustomPercent)}"
                        aria-label="${t("checkoutDonationPercent")} — ${t("checkoutDonationCustom")}"
                      />
                      <span class="checkout-donation__custom-suffix">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="checkout-donation__none${f.donationType === "none" ? " checkout-donation__none--active" : ""}"
                data-action="set-donation"
                data-donation-type="none"
                data-testid="donation-none"
              >${t("checkoutDonationNone")}</button>
            </div>
            <div class="checkout-summary__total">
              <span>${t("checkoutSubtotal")}</span>
              <strong data-testid="checkout-subtotal">${formatPrice(subtotal)}</strong>
            </div>
            ${f.tipPercent > 0 ? `
            <div class="checkout-summary__tip-row" data-testid="checkout-tip-amount">
              <span>${t("checkoutTip")} (${f.tipPercent}%)</span>
              <span>${formatPrice(tipAmount)}</span>
            </div>` : ""}
            ${f.donationType !== "none" ? `
            <div class="checkout-summary__tip-row" data-testid="checkout-donation-amount">
              <span>${escapeHtml(DONATION_ASSOCIATION)}</span>
              <span>${formatPrice(donationAmount)}</span>
            </div>` : ""}
            <div class="checkout-summary__total checkout-summary__grand-total" data-testid="checkout-total">
              <span>${t("checkoutTotal")}</span>
              <strong>${formatPrice(grandTotal)}</strong>
            </div>
          </section>
          <button type="submit" class="checkout-submit" data-testid="place-order">
            ${t("checkoutPlaceOrder")}
          </button>
        </form>
      </div>
    </main>
    <div class="cart-layer" aria-hidden="${!drawerOpen}" data-cart-open="${drawerOpen}">
      <button type="button" class="cart-backdrop" data-action="close-cart" aria-label="Close cart" tabindex="${drawerOpen ? 0 : -1}"></button>
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" data-testid="cart-drawer">
        <div class="cart-drawer__head">
          <h2 id="cart-drawer-title" class="cart-drawer__title">${t("cartTitle")}</h2>
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

/**
 * Surgically update the donation-related totals without re-rendering the page.
 * Called while the user is typing in a custom donation field so the input
 * element is never destroyed and the cursor stays in place.
 */
export function patchDonationSummary(cart: CartStore): void {
  const f = checkoutForm;
  const subtotal = cartSubtotal(cart);
  const tipAmount = subtotal * f.tipPercent / 100;
  const donationAmt =
    f.donationType === "fixed"   ? f.donationAmount :
    f.donationType === "percent" ? subtotal * f.donationAmount / 100 :
    0;
  const grandTotal = subtotal + tipAmount + donationAmt;

  // 1. Donation summary row — insert, update, or remove.
  const grandTotalEl = document.querySelector<HTMLElement>('[data-testid="checkout-total"]');
  const existingDonRow = document.querySelector<HTMLElement>('[data-testid="checkout-donation-amount"]');
  if (f.donationType !== "none") {
    const html = `<div class="checkout-summary__tip-row" data-testid="checkout-donation-amount"><span>${escapeHtml(DONATION_ASSOCIATION)}</span><span>${formatPrice(donationAmt)}</span></div>`;
    if (existingDonRow) {
      existingDonRow.outerHTML = html;
    } else if (grandTotalEl) {
      grandTotalEl.insertAdjacentHTML("beforebegin", html);
    }
  } else {
    existingDonRow?.remove();
  }

  // 2. Grand total amount text.
  const grandTotalStrong = document.querySelector<HTMLElement>('[data-testid="checkout-total"] strong');
  if (grandTotalStrong) {
    grandTotalStrong.textContent = formatPrice(grandTotal);
  }

  // 3. Toggle active class on each custom input.
  document.querySelector('[data-donation-custom="fixed"]')?.classList.toggle(
    "checkout-donation__custom-input--active",
    f.donationType === "fixed" && f.donationCustomFixed !== ""
  );
  document.querySelector('[data-donation-custom="percent"]')?.classList.toggle(
    "checkout-donation__custom-input--active",
    f.donationType === "percent" && f.donationCustomPercent !== ""
  );

  // 4. Deactivate preset buttons for whichever group the user is now typing in.
  document.querySelectorAll<HTMLElement>("[data-action='set-donation'][data-donation-amount]").forEach((btn) => {
    const type = btn.dataset.donationType as "fixed" | "percent";
    const amt  = parseInt(btn.dataset.donationAmount ?? "0", 10);
    const noCustom = type === "fixed" ? f.donationCustomFixed === "" : f.donationCustomPercent === "";
    btn.classList.toggle(
      "checkout-donation__btn--active",
      f.donationType === type && f.donationAmount === amt && noCustom
    );
  });
}

function renderOrderSummary(cart: CartStore): string {
  const lines = cart.getLines();
  if (lines.length === 0) {
    return `<p class="checkout-summary__empty">${t("checkoutNoItems")}</p>`;
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
