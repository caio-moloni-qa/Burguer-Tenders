# Burguer-Tenders — Business Rules

> **Scope:** This document describes every business rule enforced by the application, organized by domain. Code snippets reference the actual source files. The main goal of this project is to enforce the usage of automated tests mainly using Playwright.

---

## Table of Contents

1. [Product Catalog](#1-product-catalog)
2. [Store Network & Service Areas](#2-store-network--service-areas)
3. [Delivery Location](#3-delivery-location)
4. [Cart](#4-cart)
5. [Checkout Validation](#5-checkout-validation)
6. [Order Placement](#6-order-placement)
7. [Navigation & Views](#7-navigation--views)
8. [Address Geocoding](#8-address-geocoding)
9. [UI Feedback Rules](#9-ui-feedback-rules)
10. [Dynamic Translation](#10-dynamic-translation)

---

## 1. Product Catalog

### 1.1 Fixed catalog
The product list is static and defined in `src/data/products.ts`. There is no backend catalog API; all items are available at all times.

| Category | ID | Name | Price | Spicy |
|---|---|---|---|---|
| burger | `cheeseburguer` | Cheeseburguer | $3.49 | No |
| burger | `cheeseburguer-bacon` | Cheeseburguer Bacon | $4.99 | No |
| burger | `avocado-burger` | Avocado Burguer | $6.49 | No |
| burger | `bt-special` | BT Special | $7.49 | Yes |
| tenders | `pack-tenders` | Pack of tenders | $6.99 | No |
| tenders | `pack-tenders-spicy` | Spicy pack of tenders | $7.49 | Yes |
| combo | `combo-tenders-cheeseburguer` | Chicken Tenders + Cheeseburguer | $9.99 | No |
| combo | `combo-bacon-fries` | Cheeseburguer Bacon + Plain Fries | $8.49 | No |
| combo | `combo-spicy-milkshake` | Spicy Tenders + Chocolate Milkshake | $10.49 | Yes |
| combo | `combo-tenders-drink` | Tenders + Drink | $8.99 | No |
| drink | `doctor-bt` | Doctor BT | $2.99 | No |
| drink | `guarana` | Guaraná | $2.99 | No |
| side | `fries-plain` | Plain BT French Fries | $3.49 | No |
| side | `fries-lemon-pepper` | BT Fries — Lemon Pepper | $3.99 | No |
| side | `milkshake-chocolate` | Chocolate Milkshake | $4.49 | No |
| side | `milkshake-strawberry` | Strawberry Milkshake | $4.49 | No |

### 1.2 Product shape
Every product must have: `id`, `name`, `shortName`, `description`, `imageSrc`, `priceUsd`, `category`, and `spicy` (boolean).

```ts
// src/types/product.ts
export type ProductCategory = "burger" | "tenders" | "combo" | "drink" | "side";

export type Product = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  imageSrc: string;       // public URL path, e.g. /images/products/cheeseburguer.png
  priceUsd: number;       // USD — display only, not a billing engine
  category: ProductCategory;
  spicy: boolean;
};
```

### 1.3 Spicy badge
Products with `spicy: true` display an uppercase "SPICY" badge on the product card. No other visual distinction is applied.

### 1.4 Prices are in USD
All prices are stored as `number` in USD and formatted with `Intl.NumberFormat`:

```ts
// src/ui/cartHtml.ts
export function formatPrice(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);
}
```

### 1.5 Category filter
The menu toolbar exposes a `<select>` dropdown that filters the product grid by category. The available options are **All**, **Burgers**, **Tenders**, **Combos**, **Drinks**, and **Sides**. The selected filter persists across re-renders (cart updates, location saves, etc.) via a module-level variable in `src/ui/menu.ts`.

```ts
// src/ui/menu.ts
type MenuFilter = "all" | ProductCategory;
let activeFilter: MenuFilter = "all";

export function setMenuFilter(filter: string): void { … }

// In renderMenu — products are filtered before mapping to HTML:
const filtered = activeFilter === "all"
  ? items
  : items.filter((p) => p.category === activeFilter);
```

Changing the select fires a `change` event handled in `main.ts`, which calls `setMenuFilter` and then `render()`.

---

## 2. Store Network & Service Areas

### 2.1 Active stores

| Store ID | Display Name | Country | City | State |
|---|---|---|---|---|
| `br-londrina-higienopolis` | Burguer-Tenders Higienopolis | BR | Londrina | PR |
| `br-sp-pinheiros` | Burguer-Tenders Pinheiros | BR | São Paulo | SP |
| `us-ny-midtown` | Burguer-Tenders Midtown | US | New York | NY |

```ts
// src/data/stores.ts
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
```

### 2.2 Store resolution
A store is matched to a delivery address by **country code + city + state**. Matching is accent-insensitive and case-insensitive.

```ts
// src/data/stores.ts
function normalizeCity(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
```

- For **Brazil (BR)**: state is stored as 2-letter UF code (e.g. `PR`, `SP`).
- For **USA (US)**: Nominatim may return either the 2-letter code (`NY`) or full name (`New York`). Both are normalized to the 2-letter code.

```ts
// src/data/stores.ts
const US_STATE_NAME_TO_CODE: Record<string, string> = {
  "new york": "NY", california: "CA", texas: "TX",
  florida: "FL", illinois: "IL",
};
```

### 2.3 No cross-country matching
A BR store never matches a US address and vice versa. The first filter in `resolveStoreForDelivery` is `store.countryCode !== cc`.

### 2.4 No store → no delivery
If no store serves the resolved city/state, the user **cannot save** the location. An alert is shown and the panel stays open.

```ts
// src/main.ts
if (!locationDelivery.storeId.trim()) {
  window.alert(
    "We don't deliver to this address yet. Use a ZIP in an area we serve…"
  );
  return;
}
```

---

## 3. Delivery Location

### 3.1 Location is required before adding to cart
A user cannot add a product to the cart without a saved delivery location. Attempting to do so opens the location panel instead and stores the intended product as `pendingAddProductId`.

```ts
// src/main.ts — handleCartAction
case "add-to-cart":
  if (!hasDeliveryLocation()) {
    pendingAddProductId = productId;
    openLocationPanel();
    return;
  }
  cart.addProductSilent(productId, 1);
  patchCartDOM();
```

### 3.2 `hasDeliveryLocation` — three conditions
A delivery location is considered **valid and saved** only when all three are true:

```ts
// src/location/location.ts
export function hasDeliveryLocation(): boolean {
  return (
    deliverySyncedWithServer &&                    // POSTed to server at least once
    locationDelivery.zipCode.trim().length > 0 &&  // ZIP is non-empty
    locationDelivery.storeId.trim().length > 0     // resolves to a known store
  );
}
```

### 3.3 Delivery state is draft until saved
Typing in the location panel updates an in-memory draft (`locationDelivery` object) and sets `deliverySyncedWithServer = false`. The state only becomes valid after a successful `POST /api/delivery`.

### 3.4 Pending add after location save
If a user tried to add a product before setting a location and then saves the location, the pending product is added automatically and a toast is shown.

```ts
// src/main.ts
if (pendingAddProductId) {
  const name = getProductById(pendingAddProductId)?.name ?? "Item";
  cart.addProductSilent(pendingAddProductId, 1);
  pendingAddProductId = null;
  showCartToast(name);
}
```

### 3.5 Auto-lookup on ZIP blur
When the ZIP input loses focus and contains a valid-length ZIP (8 digits for BR, 5 digits for US), an address lookup is triggered automatically — **unless** the user is clicking the "Look up address" button, in which case the button click is the sole driver to avoid a parallel-request race.

```ts
// src/main.ts
root.addEventListener("focusout", (ev) => {
  if (!target?.matches("#location-zip")) return;
  // Suppress auto-trigger when clicking the lookup button directly.
  const related = (ev as FocusEvent).relatedTarget as HTMLElement | null;
  if (related?.closest("[data-action='lookup-address']")) return;
  if (!shouldAutoLookupPostal(locationDelivery.zipCode, locationDelivery.countryCode)) return;
  void runPostalLookup();
});
```

### 3.6 Session persistence
The delivery payload (including `storeId`) is persisted server-side per session cookie (`bt_sid`). On page load, `GET /api/delivery` restores the saved address.

### 3.7 Country selector drives the store list
The location panel shows only the stores available for the **currently selected country**. Changing the country select causes an immediate re-render of the store list.

### 3.8 Checkout ZIP fallback
On the checkout page, if the checkout ZIP field is empty, the saved delivery ZIP is used automatically.

```ts
// src/main.ts — go-checkout case
if (!checkoutForm.zipCode.trim() && locationDelivery.zipCode.trim()) {
  checkoutForm.zipCode = locationDelivery.zipCode;
}
```

---

## 4. Cart

### 4.1 Quantity management
- **Add:** increments quantity by 1 per click.
- **Increment (＋):** same as add.
- **Decrement (−):** reduces by 1; if quantity reaches 0 the line is removed.
- **Remove:** deletes the line entirely regardless of quantity.

### 4.2 Cart mutations use silent variants inside the open drawer
To prevent the cart panel from re-rendering on every add/remove/decrement, all quantity mutations that happen while the drawer is open use **silent** variants that do not call `emit()`. After the silent mutation, `patchCartDOM()` surgically updates the three affected DOM regions:

```ts
// src/cart/cartStore.ts — silent variants (no emit)
addProductSilent(productId: string, amount = 1): void { … }
setQuantitySilent(productId: string, quantity: number): void { … }
removeLineSilent(productId: string): void { … }
```

```ts
// src/main.ts
function patchCartDOM(): void {
  // 1. Re-render the lines list inside the drawer body
  const body = document.querySelector(".cart-drawer__body");
  if (body) body.innerHTML = renderCartLines(cart);

  // 2. Replace the subtotal/CTA footer in-place
  const foot = document.querySelector(".cart-drawer__foot");
  if (foot) { /* replaceWith new footer element */ }

  // 3. Update the header badge count and visibility
  const badge = document.querySelector("[data-testid='cart-count']");
  if (badge) { /* update textContent and classes */ }
}
```

The emitting variants (`addProduct`, `setQuantity`, `removeLine`) are still used by `clear()` (called after order placement) which requires a full re-render.

### 4.3 Cart is cleared on confirmed order
When the user successfully places an order, `cart.clear()` is called before navigating to the confirmation page.

```ts
// src/main.ts — submit handler
confirmedUserName = checkoutForm.fullName.trim();
cart.clear();
setView("confirmation");
```

### 4.4 Go to checkout blocked on empty cart
The "Go to checkout" button is disabled when the cart has no items:

```ts
// src/ui/cartHtml.ts
<button … ${hasItems ? "" : "disabled"}>Go to checkout</button>
```

### 4.5 Go to checkout blocked without location
If the user has no saved delivery location when clicking "Go to checkout", the location panel opens instead.

```ts
// src/main.ts
case "go-checkout":
  if (!hasDeliveryLocation()) {
    openLocationPanel();
    return;
  }
```

### 4.6 Subtotal calculation
The subtotal is the sum of `priceUsd × quantity` for every line in the cart. No taxes or fees are added (demo).

```ts
// src/ui/cartHtml.ts
export function cartSubtotal(cart: CartStore): number {
  let total = 0;
  for (const line of cart.getLines()) {
    const p = getProductById(line.productId);
    if (p) total += p.priceUsd * line.quantity;
  }
  return total;
}
```

---

## 5. Checkout Validation

All validation runs client-side on form submit. The first invalid field receives focus automatically.

### 5.1 Required fields (always)

| Field | Rule |
|---|---|
| Full name | Must not be blank |
| Email | Must contain `@` with at least one character before it, and a domain with a `.` after `@` |
| ZIP / Postal code | The checkout ZIP or the saved delivery ZIP must be non-empty |

```ts
// src/checkout/validateCheckout.ts
function isValidEmail(s: string): boolean {
  const at = s.trim().indexOf("@");
  if (at < 1) return false;
  const domain = s.trim().slice(at + 1);
  return domain.length > 0 && domain.includes(".");
}
```

### 5.2 Card fields — conditional (payment method = "card")

| Field | Required | Format rule |
|---|---|---|
| Name on card | Yes | Letters (including accented), spaces, hyphens, and apostrophes only — no digits or other special characters |
| Card number | Yes | 13–19 digits (spaces stripped); auto-formatted as `XXXX XXXX XXXX XXXX` while typing |
| Expiry | Yes | `MM / YY` format; month must be 01–12; date must not be in the past |
| Security code (CVC) | Yes | Exactly 3 or 4 digits; rendered as `type="password"` |

```ts
// src/checkout/validateCheckout.ts

function isValidCardName(s: string): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/.test(s.trim());
}

function isValidCardNumber(s: string): boolean {
  const digits = s.replace(/\s/g, "");
  return /^\d{13,19}$/.test(digits);
}

function isValidExpiry(s: string): boolean {
  const digits = s.replace(/\D/g, "");
  if (digits.length !== 4) return false;
  const month = parseInt(digits.slice(0, 2), 10);
  const year  = parseInt(digits.slice(2, 4), 10) + 2000;
  if (month < 1 || month > 12) return false;
  return new Date(year, month) > new Date(); // card valid through end of expiry month
}

function isValidCvc(s: string): boolean {
  return /^\d{3,4}$/.test(s.trim());
}
```

### 5.3 Real-time card input formatting
Card inputs are cleaned and formatted on every `input` event — before the value is stored in `checkoutForm`. No re-render is triggered; only `el.value` is updated in-place.

| Field | Transformation |
|---|---|
| Name on card | Strip any character that is not a letter, space, hyphen, or apostrophe |
| Card number | Strip non-digits → cap at 16 → group into blocks of 4 with spaces |
| Expiry | Strip non-digits → cap at 4 → format as `MM / YY` |
| Security code | Strip non-digits → cap at 4 |

```ts
// src/main.ts — input event handler (card fields excerpt)
} else if (field === "cardNumber") {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  const formatted = digits.match(/.{1,4}/g)?.join(" ") ?? digits;
  el.value = formatted;
  checkoutForm.cardNumber = formatted;
} else if (field === "cardExpiry") {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  const formatted = digits.length > 2
    ? `${digits.slice(0, 2)} / ${digits.slice(2)}`
    : digits;
  el.value = formatted;
  checkoutForm.cardExpiry = formatted;
}
```

### 5.4 Payment methods
Two options: `"card"` (default) and `"pay-in-restaurant"`. Switching to "pay in restaurant" clears any existing card validation errors immediately.

### 5.5 Validation error display
Inline error messages appear below each invalid field. Fields also receive a red border + light-red background. Errors are cleared field-by-field as the user types.

### 5.6 Focus order on error
The browser focus is sent to the first invalid field in this fixed order: `fullName` → `email` → `zipCode` → `cardNameOnCard` → `cardNumber` → `cardExpiry` → `cardCvc`.

---

## 6. Order Placement

### 6.1 Checkout delivery data (read-only)
The checkout page shows the full saved delivery address in non-editable inputs. The user cannot change the delivery address from the checkout page; they must go back to the menu and use the location panel.

### 6.2 Estimated delivery time
Every confirmed order shows a fixed **30-minute** ETA. This is a training demo value and is not dynamic.

### 6.3 Confirmation page content
After a successful order:
- Personalised greeting: **"Thank you, [Name]!"**
- Animated green check circle
- ETA pill (clock icon + "Estimated delivery: 30 min")
- Full delivery address block (same fields as checkout: ZIP, street, neighborhood, city/state, country, complement)
- The fulfilling store name is displayed above the address fields

### 6.4 Cart cleared on confirmation
The cart is emptied immediately when `setView("confirmation")` is called — before rendering the confirmation page.

---

## 7. Navigation & Views

### 7.1 Three views
The SPA has exactly three views:

```ts
// src/navigation.ts
export type AppView = "shop" | "checkout" | "confirmation";
```

| View | Shown when |
|---|---|
| `shop` | Default / after "Back to menu" |
| `checkout` | After "Go to checkout" (750 ms spinner delay) |
| `confirmation` | After successful order submit |

### 7.2 Header brand is always a home link
The logo and site title in the header are wrapped in a `<button data-action="go-home">`. Clicking it from any view returns the user to `shop`, clears checkout validation errors, closes any open drawers, and clears `pendingAddProductId`.

### 7.3 Checkout transition has a loading delay
Clicking "Go to checkout" triggers a 750 ms full-screen spinner overlay before the view changes, giving visual feedback that something is happening.

### 7.4 Escape key closes panels
Pressing `Escape` closes the location panel first (if open), then the cart drawer (if open). One key press, one action.

```ts
// src/main.ts
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  if (getLocationPanelOpen()) { closeLocationPanel(); return; }
  if (cart.isDrawerOpen()) { cart.closeDrawer(); }
});
```

### 7.5 Only one panel open at a time
Opening the cart closes the location panel, and vice versa.

```ts
// src/main.ts
case "toggle-cart":
  if (getLocationPanelOpen()) closeLocationPanel();
  cart.toggleDrawer();
  break;
case "toggle-location":
  if (cart.isDrawerOpen()) cart.closeDrawer();
  toggleLocationPanel();
  break;
```

---

## 8. Address Geocoding

### 8.1 Geocoding providers by country

| Country | Primary | Fallback |
|---|---|---|
| Brazil (`BR`) | **ViaCEP** (full national CEP database, no API key) | OpenStreetMap Nominatim |
| All others | **Nominatim** (OpenStreetMap) | — |

ViaCEP is preferred for Brazil because Nominatim frequently lacks CEP centroid data.

### 8.2 Nominatim retry strategy (Brazil)
For BR, up to five query shapes are attempted with 350 ms delays between them to respect Nominatim's rate limit (~1 req/s):

```js
// server/index.mjs
attempts.push({ postalcode: normalized, countrycodes: "br" });
attempts.push({ postalcode: digits,     countrycodes: "br" });
attempts.push({ q: `${digits}, Brasil`, countrycodes: "br" });
attempts.push({ q: `${normalized}, Brasil`, countrycodes: "br" });
attempts.push({ q: digits,              countrycodes: "br" });
```

### 8.3 Postal code normalization
- **BR:** raw digits are formatted as `XXXXX-XXX` for display; lookups use the 8-digit form.
- **US:** ZIP+4 (`12345-6789`) is stripped to 5 digits.

### 8.4 Auto-trigger threshold

| Country | Trigger |
|---|---|
| Brazil | Exactly **8 digits** entered in ZIP field |
| USA | Exactly **5 digits** entered in ZIP field |

The lookup fires automatically when the ZIP field loses focus — unless focus is moving to the "Look up address" button, in which case the button click drives the lookup. The user can always click "Look up address" manually.

### 8.5 No API key required
Both ViaCEP and Nominatim are free and keyless. Nominatim requires a descriptive `User-Agent` header (configurable via `NOMINATIM_USER_AGENT` env var).

---

## 9. UI Feedback Rules

### 9.1 Add-to-cart toast
A green bottom toast appears for **2.5 seconds** with a 350 ms fade-out whenever a product is successfully added to the cart.

```ts
// src/ui/toast.ts
el.textContent = `${itemName} was successfully added to cart!`;
// auto-hides after HIDE_AFTER_MS = 2500ms
```

If another item is added while the toast is visible, the timer resets and the message updates in place.

### 9.2 Store banner on menu
Once a location is saved (and resolves to a known store), a banner appears above the product grid:

> **Ordering from** Burguer-Tenders Pinheiros

The banner is shown as long as `locationDelivery.storeId` is non-empty, independent of the full `hasDeliveryLocation()` check.

### 9.3 Location panel store status
The location panel shows a live status under the ZIP row:

| State | Message |
|---|---|
| No city/state yet | "Enter your ZIP and use Look up address…" |
| City/state resolved, no matching store | "We don't deliver to this city yet." |
| Matching store found | "Delivery available from **[Store Name]**" |

This status updates when address lookup completes or when the country select changes — not on every keystroke.

### 9.4 Lookup button disabled during request
While `runPostalLookup` is in flight, the button is disabled and its label changes to "Looking up…". This is achieved by direct DOM mutation (no full re-render):

```ts
// src/main.ts
btn.disabled = opts.loading;
btn.textContent = opts.loading ? "Looking up…" : "Look up address";
```

### 9.5 No re-render while typing in panels or mutating the cart
Three separate strategies are used to avoid unnecessary full re-renders:

| Trigger | Strategy |
|---|---|
| Typing in the location panel | `clearLookupErrorSilent()` — updates state without `emit()` |
| Typing in card/checkout fields | Direct `checkoutForm` mutation only, no `emit()` |
| Adding/removing items in the open cart drawer | Silent cart mutations + `patchCartDOM()` — patches only the 3 affected DOM nodes |
| Country select change in location panel | `emitLocationChange()` — triggers a deliberate re-render |
| Address lookup completion | `emitLocationChange()` — single clean re-render after all state is updated |

### 9.6 Cart badge count
The cart icon in the header shows a yellow badge with the total item count when the cart is non-empty. The badge is hidden when the cart is empty. It is updated by `patchCartDOM()` on every cart mutation, so it always reflects the live count without a full page re-render.

### 9.7 Browser tab favicon
The application displays a custom burger SVG icon in the browser tab, defined in `public/favicon.svg` and linked via `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` in `index.html`.

### 9.8 Category filter empty state
If no products exist in the selected category, the product grid shows a centered placeholder message:

```html
<p class="menu__empty">No items in this category yet.</p>
```

---

## 10. Dynamic Translation

### 10.1 Overview
When a user looks up an address and the result resolves to a known store, the entire UI switches language and currency to match the store's country. There are two supported locales:

| Country | Locale | Currency |
|---|---|---|
| United States (`US`) | `en-US` (English) | USD (`$`) |
| Brazil (`BR`) | `pt-BR` (Portuguese) | BRL (`R$`) |

The locale module lives in `src/i18n/locale.ts` and is the single source of truth for all translatable strings and price formatting.

### 10.2 Trigger: "Look up address" button
Translation is triggered automatically after the "Look up address" button is clicked and the geocoding response resolves to a city served by a known store.

```ts
// src/main.ts — runPostalLookup (success path)
syncResolvedStoreFromAddress();
lookupLoadingEnd();

// If a store was resolved, apply the locale and do a full re-render.
if (locationDelivery.storeId) {
  setLocale(locationDelivery.countryCode);
  emitLocationChange();   // triggers render() across the whole UI
  return;
}
```

If the looked-up city does not match any store, the locale is **not** changed and the standard `patchLookupDOM` path runs as usual.

### 10.3 Session restore
When the page loads and a previously saved delivery is hydrated from the session cookie, the locale is restored before the first render so the UI appears in the correct language immediately on reload.

```ts
// src/main.ts — fetchDelivery bootstrap
if (d.countryCode) {
  setLocale(d.countryCode);
}
render();
```

### 10.4 Scope of translation
Every user-visible string in the application is routed through `t(key)`. The following areas are translated:

| Area | Examples |
|---|---|
| Menu page | "Available to buy" → "Disponível para compra", category filter options, "Add to cart" → "Adicionar ao carrinho", "Spicy" → "Picante" |
| Cart drawer | "Cart" → "Carrinho", "Your cart is empty." → "Seu carrinho está vazio.", "Go to checkout" → "Ir para o pagamento" |
| Checkout page | All field labels, fieldset legends, payment options, "Place order" → "Fazer pedido" |
| Confirmation page | "Thank you, {name}!" → "Obrigado(a), {name}!", "Your order is placed!" → "Seu pedido foi realizado!", "Back to menu" → "Voltar ao menu" |
| Location panel | All labels, status messages, button text ("Look up address" → "Buscar endereço", "Save location" → "Salvar localização") |
| Add-to-cart toast | "{item} was successfully added to cart!" → "{item} foi adicionado ao carrinho com sucesso!" |
| Header | ARIA labels for the location and cart icon buttons |

### 10.5 Currency formatting
Prices are stored as `priceUsd` (USD). The `formatPrice(usd)` function in `src/i18n/locale.ts` replaces the original static formatter from `cartHtml.ts`:

```ts
// src/i18n/locale.ts
const USD_TO_BRL = 5.7;

export function formatPrice(usd: number): string {
  if (activeLocale === "pt-BR") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(usd * USD_TO_BRL);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);
}
```

- For **US**: price is shown in USD, e.g. `$3.49`.
- For **BR**: price is converted using a fixed rate (`× 5.7`) and displayed in BRL format, e.g. `R$\u00a019,89`. This is a training-demo value and is not a live exchange rate.

The same `formatPrice` is used in every context where a price appears: product cards, cart lines, cart subtotal, checkout order summary, and checkout subtotal.

### 10.6 Translation API
```ts
// src/i18n/locale.ts

export type Locale = "en-US" | "pt-BR";

export function setLocale(countryCode: string): void { … }
export function getLocale(): Locale { … }

/**
 * Returns the translated string for `key` in the active locale.
 * `vars` replaces {placeholder} tokens, e.g. t("confirmTitle", { name: "Alice" }).
 */
export function t(key: TranslationKey, vars?: Record<string, string>): string { … }
export function formatPrice(usd: number): string { … }
```

String keys with dynamic content use `{placeholder}` tokens:

| Key | EN value | PT value |
|---|---|---|
| `confirmTitle` | `"Thank you, {name}!"` | `"Obrigado(a), {name}!"` |
| `confirmEta` | `"Estimated delivery: {time}"` | `"Entrega estimada: {time}"` |
| `locationStoreAvailable` | `"Delivery available from {store}"` | `"Entrega disponível por {store}"` |
| `toastAddedToCart` | `"{item} was successfully added to cart!"` | `"{item} foi adicionado ao carrinho com sucesso!"` |

### 10.7 No re-render while typing
The locale switch happens exclusively on a completed address lookup, not on every keystroke or country-select change. When switching countries in the location panel, only the stores list and store-status paragraph are patched in-place (`patchLocationCountryDOM`) — the locale itself does not change until a lookup resolves to a known store.

---

*Last updated: April 2026 — Burguer-Tenders training project.*
