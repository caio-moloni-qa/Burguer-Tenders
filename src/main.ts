import "../design/palette.css";
import "./styles/app.css";
import { fetchDelivery, saveDelivery, type DeliveryPayload } from "./api/deliveryApi";
import { lookupAddressByPostalCode } from "./api/geocodeApi";
import { createCartStore } from "./cart/cartStore";
import {
  checkoutValidationErrors,
  clearCheckoutValidationError,
  clearCheckoutValidationErrors,
} from "./checkout/checkoutErrors";
import { checkoutForm, type PaymentMethod, type TipPercent, type DonationType } from "./checkout/checkoutForm";
import { checkoutFieldFocusId, validateCheckout } from "./checkout/validateCheckout";
import { getProductById, products } from "./data/products";
import {
  clearLookupErrorSilent,
  closeLocationPanel,
  emitLocationChange,
  getLocationLookupLoading,
  getLocationPanelOpen,
  hasDeliveryLocation,
  locationDelivery,
  lookupLoadingEnd,
  lookupLoadingStart,
  markDeliverySynced,
  markDeliveryUnsaved,
  openLocationPanel,
  setDeliveryFromServer,
  setLocationLookupState,
  subscribeLocation,
  syncResolvedStoreFromAddress,
  toggleLocationPanel,
} from "./location/location";
import { setLocale, fromDisplayPrice } from "./i18n/locale";
import { getView, setView, subscribeView } from "./navigation";
import { renderCheckoutView, patchDonationSummary } from "./ui/checkoutView";
import { renderConfirmationView } from "./ui/confirmationView";
import { renderMenu, setMenuFilter, setMenuSearch } from "./ui/menu";
import { buildStoresBlockHtml, buildStoreStatusHtml } from "./ui/locationLayerHtml";
import { renderCartLines, renderCartDrawerFoot } from "./ui/cartHtml";
import { hidePageSpinner, showPageSpinner } from "./ui/pageSpinner";
import { showCartToast } from "./ui/toast";

const rootEl = document.querySelector<HTMLDivElement>("#app");
if (!rootEl) {
  throw new Error("Missing #app root");
}
const root = rootEl;

const cart = createCartStore();

/** When add-to-cart is blocked by missing location, we add this product after a successful save. */
let pendingAddProductId: string | null = null;

function deliveryPayload(): DeliveryPayload {
  syncResolvedStoreFromAddress();
  return {
    zipCode: locationDelivery.zipCode,
    countryCode: locationDelivery.countryCode,
    streetLine: locationDelivery.streetLine,
    neighborhood: locationDelivery.neighborhood,
    city: locationDelivery.city,
    state: locationDelivery.state,
    country: locationDelivery.country,
    complement: locationDelivery.complement,
    storeId: locationDelivery.storeId,
  };
}

async function persistLocationAndClose(): Promise<void> {
  syncResolvedStoreFromAddress();
  if (!locationDelivery.storeId.trim()) {
    window.alert(
      "We don't deliver to this address yet. Use a ZIP in an area we serve — e.g. Londrina (PR), São Paulo (SP), Brazil, or New York (NY), USA — then look up your address before saving."
    );
    return;
  }
  try {
    const saved = await saveDelivery(deliveryPayload());
    setDeliveryFromServer(saved);
    syncResolvedStoreFromAddress();
    markDeliverySynced();
    closeLocationPanel();
    if (pendingAddProductId) {
      const name = getProductById(pendingAddProductId)?.name ?? "Item";
      cart.addProductSilent(pendingAddProductId, 1);
      pendingAddProductId = null;
      showCartToast(name);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not save location";
    window.alert(msg);
  }
}

function shouldAutoLookupPostal(zip: string, countryCode: string): boolean {
  const digits = zip.replace(/\D/g, "");
  if (countryCode === "BR") {
    return digits.length === 8;
  }
  return digits.length === 5;
}

/** Patch only the lookup-related DOM nodes — no full panel re-render. */
function patchLookupDOM(opts: {
  loading: boolean;
  error?: string;
  fields?: Record<string, string>;
}): void {
  const btn = document.querySelector<HTMLButtonElement>(
    "[data-testid='location-lookup']"
  );
  const saveBtn = document.querySelector<HTMLButtonElement>(
    "[data-testid='location-save']"
  );

  if (btn) {
    btn.disabled = opts.loading;
    if (opts.loading) {
      btn.innerHTML = `<span class="location-lookup-btn__spinner" aria-hidden="true"></span><span class="sr-only">Looking up…</span>`;
    } else {
      btn.textContent = "Look up address";
    }
  }

  if (saveBtn) {
    if (opts.loading) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<span class="location-lookup-btn__spinner" aria-hidden="true"></span><span class="sr-only">Saving…</span>`;
    } else {
      // Re-enable after a short delay so the save button stays locked until
      // the lookup spinner is visually gone.
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save location";
      }, 500);
    }
  }

  // Update input field values so they reflect the fetched data without a re-render.
  if (opts.fields) {
    for (const [field, value] of Object.entries(opts.fields)) {
      const input = document.querySelector<HTMLInputElement>(
        `[data-location-field="${field}"]`
      );
      if (input && input !== document.activeElement) {
        input.value = value;
      }
    }
  }

  // Error block — update or insert/remove in-place.
  const body = document.querySelector<HTMLElement>(".location-drawer__body");
  const existingErr = body?.querySelector<HTMLElement>(
    "[data-testid='location-lookup-error']"
  );
  if (opts.error) {
    const html = `<p class="location-drawer__error" role="alert" data-testid="location-lookup-error">${opts.error}</p>`;
    if (existingErr) {
      existingErr.outerHTML = html;
    } else if (body) {
      const zipRow = body.querySelector(".location-zip-row");
      zipRow?.insertAdjacentHTML("afterend", html);
    }
  } else {
    existingErr?.remove();
  }

  // Store-status paragraph — replace inner HTML only.
  const statusEl = document.querySelector<HTMLElement>(
    "[data-testid='location-store-status']"
  );
  const freshStatus = buildStoreStatusHtml(locationDelivery);
  if (statusEl) {
    const tmp = document.createElement("div");
    tmp.innerHTML = freshStatus;
    const newEl = tmp.firstElementChild;
    if (newEl) {
      statusEl.replaceWith(newEl);
    }
  }
}

/**
 * Patch only the country-dependent nodes when the country <select> changes.
 * Updates the stores block and the store-status paragraph in-place — no full re-render.
 */
function patchLocationCountryDOM(): void {
  const storesContainer = document.querySelector<HTMLElement>(
    "[data-testid='location-stores-list']"
  );
  if (storesContainer) {
    storesContainer.innerHTML = buildStoresBlockHtml(locationDelivery.countryCode);
  }

  const statusEl = document.querySelector<HTMLElement>(
    "[data-testid='location-store-status']"
  );
  if (statusEl) {
    const tmp = document.createElement("div");
    tmp.innerHTML = buildStoreStatusHtml(locationDelivery);
    const newEl = tmp.firstElementChild;
    if (newEl) statusEl.replaceWith(newEl);
  }
}

/**
 * Patch only the cart-related DOM nodes — no full page re-render.
 * Updates: drawer body (lines list), drawer footer (subtotal + CTA), header badge.
 */
function patchCartDOM(): void {
  // Lines
  const body = document.querySelector<HTMLElement>(".cart-drawer__body");
  if (body) {
    body.innerHTML = renderCartLines(cart);
  }

  // Footer (subtotal + checkout button) — replace the element in-place
  const foot = document.querySelector<HTMLElement>(".cart-drawer__foot");
  if (foot) {
    const tmp = document.createElement("div");
    tmp.innerHTML = renderCartDrawerFoot(cart);
    const newFoot = tmp.firstElementChild;
    if (newFoot) {
      foot.replaceWith(newFoot);
    }
  }

  // Header badge
  const badge = document.querySelector<HTMLElement>("[data-testid='cart-count']");
  if (badge) {
    const count = cart.getTotalItemCount();
    badge.textContent = String(count);
    badge.classList.toggle("header-cart__badge--visible", count > 0);
    badge.setAttribute("aria-hidden", String(count === 0));
  }
}

async function runPostalLookup(): Promise<void> {
  const zip = locationDelivery.zipCode.trim();
  if (!zip) {
    // Tiny state update + DOM patch — no full re-render.
    setLocationLookupState({ error: "Enter a postal code first.", loading: false });
    return;
  }
  if (getLocationLookupLoading()) {
    return;
  }
  // Update state silently; patch DOM directly for the loading state.
  lookupLoadingStart();
  patchLookupDOM({ loading: true });
  try {
    const addr = await lookupAddressByPostalCode(zip, locationDelivery.countryCode);
    locationDelivery.streetLine = addr.streetLine;
    locationDelivery.neighborhood = addr.neighborhood;
    locationDelivery.city = addr.city;
    locationDelivery.state = addr.state;
    locationDelivery.country = addr.country;
    if (addr.zipCode) {
      locationDelivery.zipCode = addr.zipCode;
    }
    markDeliveryUnsaved();
    syncResolvedStoreFromAddress();
    lookupLoadingEnd();

    // If a store was resolved, apply the locale for that country and do a full
    // re-render so every string and price across the whole UI updates at once.
    if (locationDelivery.storeId) {
      setLocale(locationDelivery.countryCode);
      emitLocationChange();
      return;
    }

    patchLookupDOM({
      loading: false,
      fields: {
        zipCode: locationDelivery.zipCode,
        streetLine: locationDelivery.streetLine,
        neighborhood: locationDelivery.neighborhood,
        city: locationDelivery.city,
        state: locationDelivery.state,
        country: locationDelivery.country,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Address lookup failed";
    lookupLoadingEnd();
    patchLookupDOM({ loading: false, error: msg });
  }
}

function applyLocationField(field: string | undefined, value: string): void {
  if (!field) {
    return;
  }
  switch (field) {
    case "zipCode":
      locationDelivery.zipCode = value;
      break;
    case "countryCode":
      locationDelivery.countryCode = value.toUpperCase().slice(0, 2);
      break;
    case "streetLine":
      locationDelivery.streetLine = value;
      break;
    case "neighborhood":
      locationDelivery.neighborhood = value;
      break;
    case "city":
      locationDelivery.city = value;
      break;
    case "state":
      locationDelivery.state = value;
      break;
    case "country":
      locationDelivery.country = value;
      break;
    case "complement":
      locationDelivery.complement = value;
      break;
    default:
      return;
  }
  markDeliveryUnsaved();
  syncResolvedStoreFromAddress();
  clearLookupErrorSilent();
  // No emit here — typing alone does not re-render the panel.
}

function handleCartAction(action: string, productId: string | undefined): void {
  switch (action) {
    case "toggle-cart":
      if (getLocationPanelOpen()) {
        closeLocationPanel();
      }
      cart.toggleDrawer();
      break;
    case "close-cart":
      cart.closeDrawer();
      break;
    case "toggle-location":
      if (cart.isDrawerOpen()) {
        cart.closeDrawer();
      }
      toggleLocationPanel();
      break;
    case "close-location":
      pendingAddProductId = null;
      closeLocationPanel();
      break;
    case "save-location":
      void persistLocationAndClose();
      break;
    case "lookup-address":
      void runPostalLookup();
      break;
    case "add-to-cart":
      if (productId) {
        if (!hasDeliveryLocation()) {
          pendingAddProductId = productId;
          if (cart.isDrawerOpen()) {
            cart.closeDrawer();
          }
          openLocationPanel();
          return;
        }
        cart.addProductSilent(productId, 1);
        patchCartDOM();
        showCartToast(getProductById(productId)?.name ?? "Item");
      }
      break;
    case "inc-line":
      if (productId) {
        cart.addProductSilent(productId, 1);
        patchCartDOM();
      }
      break;
    case "dec-line":
      if (productId) {
        cart.setQuantitySilent(productId, cart.getQuantity(productId) - 1);
        patchCartDOM();
      }
      break;
    case "remove-line":
      if (productId) {
        cart.removeLineSilent(productId);
        patchCartDOM();
      }
      break;
    case "go-checkout": {
      if (!hasDeliveryLocation()) {
        if (cart.isDrawerOpen()) {
          cart.closeDrawer();
        }
        openLocationPanel();
        return;
      }
      if (cart.getTotalItemCount() === 0) {
        return;
      }
      cart.closeDrawer();
      showPageSpinner();
      setTimeout(() => {
        if (!checkoutForm.zipCode.trim() && locationDelivery.zipCode.trim()) {
          checkoutForm.zipCode = locationDelivery.zipCode;
        }
        setView("checkout");
        hidePageSpinner();
      }, 750);
      break;
    }
    case "go-home":
    case "back-to-shop":
      clearCheckoutValidationErrors();
      pendingAddProductId = null;
      if (cart.isDrawerOpen()) {
        cart.closeDrawer();
      }
      if (getLocationPanelOpen()) {
        closeLocationPanel();
      }
      setView("shop");
      break;
    default:
      break;
  }
}

type LocationFieldFocusSnapshot = {
  field: string;
  selectionStart: number;
  selectionEnd: number;
};

function getLocationFieldFocusSnapshot(): LocationFieldFocusSnapshot | null {
  const el = document.activeElement;
  if (!el?.matches("[data-location-field]")) {
    return null;
  }
  const field = el.getAttribute("data-location-field");
  if (!field) {
    return null;
  }
  let selectionStart = 0;
  let selectionEnd = 0;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    selectionStart = el.selectionStart ?? 0;
    selectionEnd = el.selectionEnd ?? 0;
  }
  return { field, selectionStart, selectionEnd };
}

function restoreLocationFieldFocus(snapshot: LocationFieldFocusSnapshot): void {
  requestAnimationFrame(() => {
    const el = Array.from(root.querySelectorAll<HTMLElement>("[data-location-field]")).find(
      (n) => n.getAttribute("data-location-field") === snapshot.field
    );
    if (!el) {
      return;
    }
    el.focus();
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      try {
        el.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
      } catch {
        /* invalid for some input types */
      }
    }
  });
}

function applyDrawerOpenState(): void {
  const locLayer = root.querySelector<HTMLElement>("[data-location-open]");
  if (locLayer) {
    const open = locLayer.dataset.locationOpen === "true";
    const drawer = locLayer.querySelector<HTMLElement>(".location-drawer");
    if (open) {
      locLayer.classList.add("location-layer--open");
      drawer?.classList.add("location-drawer--open");
    } else {
      locLayer.classList.remove("location-layer--open");
      drawer?.classList.remove("location-drawer--open");
    }
  }

  const cartLayer = root.querySelector<HTMLElement>("[data-cart-open]");
  if (cartLayer) {
    const open = cartLayer.dataset.cartOpen === "true";
    const drawer = cartLayer.querySelector<HTMLElement>(".cart-drawer");
    if (open) {
      cartLayer.classList.add("cart-layer--open");
      drawer?.classList.add("cart-drawer--open");
    } else {
      cartLayer.classList.remove("cart-layer--open");
      drawer?.classList.remove("cart-drawer--open");
    }
  }
}

let confirmedUserName = "";

/** Snapshot the caret position of an input matching `selector`, or -1 if not focused. */
function getInputFocusSnapshot(selector: string): number {
  const el = document.activeElement;
  if (!el?.matches(selector)) {
    return -1;
  }
  return (el instanceof HTMLInputElement ? el.selectionStart : null) ?? 0;
}

/** After a re-render, refocus an input and restore its caret position. */
function restoreInputFocus(selector: string, caretPos: number): void {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLInputElement>(selector);
    if (!el) {
      return;
    }
    el.focus();
    // setSelectionRange is unsupported on type="number" inputs; the browser
    // naturally places the cursor at the end after programmatic focus.
    if (el.type !== "number") {
      try {
        el.setSelectionRange(caretPos, caretPos);
      } catch {
        /* invalid for some input types */
      }
    }
  });
}

function render(): void {
  const locFocus = getLocationFieldFocusSnapshot();
  const searchCaret = getInputFocusSnapshot("[data-menu-search]");

  const view = getView();
  if (view === "checkout") {
    renderCheckoutView(root, cart);
  } else if (view === "confirmation") {
    renderConfirmationView(root, confirmedUserName);
  } else {
    renderMenu(root, products, cart);
  }
  requestAnimationFrame(applyDrawerOpenState);
  if (locFocus) {
    restoreLocationFieldFocus(locFocus);
  }
  if (searchCaret >= 0) {
    restoreInputFocus("[data-menu-search]", searchCaret);
  }
}

cart.subscribe(render);
subscribeView(render);
subscribeLocation(render);
render();

void fetchDelivery()
  .then((d) => {
    if (d) {
      setDeliveryFromServer(d);
      syncResolvedStoreFromAddress();
      markDeliverySynced();
      // Restore locale from the persisted country so the UI is already
      // translated on page load when a Brazilian location was previously saved.
      if (d.countryCode) {
        setLocale(d.countryCode);
      }
    }
    render();
  })
  .catch(() => {
    render();
  });

root.addEventListener("click", (ev) => {
  const target = ev.target as HTMLElement | null;
  const el = target?.closest<HTMLElement>("[data-action]");
  if (!el) {
    return;
  }
  const action = el.dataset.action;
  if (!action) {
    return;
  }
  if (action === "set-tip") {
    const pct = parseInt(el.dataset.tipPercent ?? "0", 10);
    if ([0, 10, 15, 20].includes(pct)) {
      checkoutForm.tipPercent = pct as TipPercent;
      if (getView() === "checkout") {
        render();
      }
    }
    return;
  }
  if (action === "set-donation") {
    const type = el.dataset.donationType as DonationType | undefined;
    if (type === "none") {
      checkoutForm.donationType = "none";
      checkoutForm.donationAmount = 0;
      checkoutForm.donationCustomFixed = "";
      checkoutForm.donationCustomPercent = "";
    } else if (type === "fixed" || type === "percent") {
      const amount = parseInt(el.dataset.donationAmount ?? "0", 10);
      if (amount > 0) {
        checkoutForm.donationType = type;
        checkoutForm.donationAmount = amount;
        // Clear both custom fields — a preset was explicitly chosen.
        checkoutForm.donationCustomFixed = "";
        checkoutForm.donationCustomPercent = "";
      }
    }
    if (getView() === "checkout") {
      render();
    }
    return;
  }
  const productId = el.dataset.productId;
  handleCartAction(action, productId);
});

root.addEventListener("input", (ev) => {
  const target = ev.target as HTMLElement | null;
  if (target?.matches("[data-menu-search]")) {
    setMenuSearch((target as HTMLInputElement).value);
    render();
    return;
  }
  if (target?.matches("[data-donation-custom]")) {
    const el = target as HTMLInputElement;
    const customType = el.dataset.donationCustom as "fixed" | "percent";
    const raw = el.value;
    const parsed = parseFloat(raw);
    const valid = raw !== "" && !isNaN(parsed) && parsed > 0;
    if (customType === "fixed") {
      checkoutForm.donationCustomFixed = raw;
      checkoutForm.donationCustomPercent = "";
      checkoutForm.donationType = valid ? "fixed" : "none";
      // The user types in the displayed currency; convert back to USD for internal storage.
      checkoutForm.donationAmount = valid ? fromDisplayPrice(parsed) : 0;
    } else {
      checkoutForm.donationCustomPercent = raw;
      checkoutForm.donationCustomFixed = "";
      checkoutForm.donationType = valid ? "percent" : "none";
      // Percentages are currency-independent; store as-is.
      checkoutForm.donationAmount = valid ? parsed : 0;
    }
    // Patch only the summary totals — do NOT re-render the whole page so the
    // input element is never replaced and the cursor stays exactly where it is.
    if (getView() === "checkout") {
      patchDonationSummary(cart);
    }
    return;
  }
  if (target?.matches("[data-location-field]")) {
    const el = target as HTMLInputElement | HTMLSelectElement;
    applyLocationField(el.dataset.locationField, el.value);
    return;
  }
  if (!target?.matches("[data-checkout-field]")) {
    return;
  }
  const el = target as HTMLInputElement;
  const field = el.dataset.checkoutField;
  const value = el.value;

  if (field === "fullName") {
    checkoutForm.fullName = value;
  } else if (field === "email") {
    checkoutForm.email = value;
  } else if (field === "zipCode") {
    checkoutForm.zipCode = value;
  } else if (field === "cardNameOnCard") {
    // Strip digits and characters that aren't letters, spaces, hyphens or apostrophes.
    const filtered = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, "");
    if (filtered !== value) {
      el.value = filtered;
    }
    checkoutForm.cardNameOnCard = filtered;
  } else if (field === "cardNumber") {
    // Keep only digits (max 16), then group into blocks of 4 separated by spaces.
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(" ") ?? digits;
    if (formatted !== value) {
      el.value = formatted;
    }
    checkoutForm.cardNumber = formatted;
  } else if (field === "cardExpiry") {
    // Keep only digits (max 4), then display as "MM / YY".
    const digits = value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2
      ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
      : digits;
    if (formatted !== value) {
      el.value = formatted;
    }
    checkoutForm.cardExpiry = formatted;
  } else if (field === "cardCvc") {
    // Digits only, max 4.
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits !== value) {
      el.value = digits;
    }
    checkoutForm.cardCvc = digits;
  }
  if (field) {
    clearCheckoutValidationError(field);
  }
});

root.addEventListener("change", (ev) => {
  const target = ev.target as HTMLElement | null;
  if (target?.matches("[data-menu-filter]")) {
    setMenuFilter((target as HTMLSelectElement).value);
    render();
    return;
  }
  if (target?.matches("[data-location-field]")) {
    const el = target as HTMLInputElement | HTMLSelectElement;
    applyLocationField(el.dataset.locationField, el.value);
    // Patch only the country-dependent nodes for the <select> — no full re-render.
    if (el.tagName === "SELECT") {
      patchLocationCountryDOM();
    }
    return;
  }
  if (target?.matches('input[name="payment-method"]')) {
    checkoutForm.paymentMethod = (target as HTMLInputElement).value as PaymentMethod;
    if (checkoutForm.paymentMethod === "pay-in-restaurant") {
      for (const k of ["cardNameOnCard", "cardNumber", "cardExpiry", "cardCvc"]) {
        clearCheckoutValidationError(k);
      }
    }
    if (getView() === "checkout") {
      render();
    }
  }
});

root.addEventListener("focusout", (ev) => {
  const target = ev.target as HTMLElement | null;
  if (!target?.matches("#location-zip")) {
    return;
  }
  if (!shouldAutoLookupPostal(locationDelivery.zipCode, locationDelivery.countryCode)) {
    return;
  }
  void runPostalLookup();
});

root.addEventListener("submit", (ev) => {
  const form = ev.target as HTMLFormElement | null;
  if (!form || form.id !== "checkout-form") {
    return;
  }
  ev.preventDefault();
  if (getView() !== "checkout") {
    return;
  }
  clearCheckoutValidationErrors();
  const result = validateCheckout(checkoutForm);
  if (!result.valid) {
    Object.assign(checkoutValidationErrors, result.errors);
    render();
    const focusId =
      result.firstFocusField != null
        ? checkoutFieldFocusId[result.firstFocusField]
        : undefined;
    requestAnimationFrame(() => {
      if (focusId) {
        document.getElementById(focusId)?.focus();
      }
    });
    return;
  }
  confirmedUserName = checkoutForm.fullName.trim();
  cart.clear();
  setView("confirmation");
});

document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") {
    return;
  }
  if (getLocationPanelOpen()) {
    pendingAddProductId = null;
    closeLocationPanel();
    return;
  }
  if (cart.isDrawerOpen()) {
    cart.closeDrawer();
  }
});
