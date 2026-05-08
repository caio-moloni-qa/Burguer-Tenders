# BeeTee's - Business Rules

> Scope: this document describes the business rules currently enforced by the
> `react-migration` branch. It supersedes the older `master` rules, which
> described the pre-migration hand-rendered TypeScript SPA.

---

## Main Changes vs `master`

1. **Branding changed from Burguer-Tenders to BeeTee's.**
   The header title is now `BeeTee's`, the tagline is `the best of both worlds`,
   the app uses `/images/app-icon.png`, and store display names use BeeTee's.

2. **The frontend stack migrated to React.**
   The app now runs through `src/main.tsx` and `src/App.tsx`, uses React 19,
   MUI components/theme, and Zustand stores in `src/stores/*`. The previous
   manual HTML rendering modules under `src/ui/*`, old `src/main.ts`, and old
   module-level stores were removed.

3. **Playwright tests were reorganized.**
   Tests live under `playwright/tests`, shared data is under
   `playwright/data`, helpers under `playwright/helpers`, and Page Object Model
   classes under `playwright/pages`.

4. **Menu interaction changed.**
   The category filter is a MUI `ToggleButtonGroup` instead of a `<select>`.
   Search is a collapsible icon-triggered input. A rotating promo banner was
   added above the menu.

5. **Adding an item now opens a customizer.**
   Once a valid delivery location exists, clicking "Add to cart" opens an item
   customizer dialog. The product is only added after the user confirms the
   customizer.

6. **Cart lines now support customization.**
   Cart lines are keyed by line id, not only product id. Customized items have
   unique line ids, store their own `unitPriceUsd`, and keep a
   `customizationSummary`.

7. **Several old DOM-patching rules no longer apply.**
   React and Zustand now drive rendering. The previous silent mutation +
   `patchCartDOM`, `patchDonationSummary`, and caret-restoration rules from
   `master` are obsolete.

---

## Table of Contents

1. [Product Catalog](#1-product-catalog)
2. [Rebrand and Presentation](#2-rebrand-and-presentation)
3. [Store Network and Service Areas](#3-store-network-and-service-areas)
4. [Delivery Location](#4-delivery-location)
5. [Product Customization](#5-product-customization)
6. [Cart](#6-cart)
7. [Checkout Validation](#7-checkout-validation)
8. [Tips and Donations](#8-tips-and-donations)
9. [Order Placement](#9-order-placement)
10. [Navigation and UI State](#10-navigation-and-ui-state)
11. [Address Geocoding](#11-address-geocoding)
12. [Dynamic Translation and Currency](#12-dynamic-translation-and-currency)
13. [Automated Test Structure](#13-automated-test-structure)

---

## 1. Product Catalog

### 1.1 Fixed catalog

The catalog is static and defined in `src/data/products.ts`. There is no backend
catalog API.

| Category | Count | Notes |
|---|---:|---|
| `burger` | 4 | Includes `bt-special`, which is spicy |
| `tenders` | 2 | Includes `pack-tenders-spicy`, which is spicy |
| `combo` | 4 | Includes `combo-spicy-milkshake`, which is spicy |
| `drink` | 2 | Includes `doctor-bt` and `guarana` |
| `side` | 4 | Includes fries and milkshakes |

The full catalog still contains 16 products. Product ids and prices remain the
same as `master`.

### 1.2 Product shape

Every product must expose:

```ts
type Product = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  imageSrc: string;
  priceUsd: number;
  category: "burger" | "tenders" | "combo" | "drink" | "side";
  spicy: boolean;
};
```

`priceUsd` remains the canonical stored amount. Localized display conversion is
handled separately by `src/i18n/locale.ts`.

### 1.3 Spicy badge

Products with `spicy: true` display a MUI `Chip` with a fire icon and localized
text:

- English: `Spicy`
- Portuguese: `Picante`

No other product availability rule depends on `spicy`.

### 1.4 Category filtering

The menu category filter is a MUI `ToggleButtonGroup`, not a native select. It
offers these filter values:

| Value | Meaning |
|---|---|
| `all` | All 16 products |
| `burger` | Burger products only |
| `tenders` | Tender products only |
| `combo` | Combo products only |
| `drink` | Drink products only |
| `side` | Side products only |

The selected filter is stored in `useUiStore.menuFilter` and survives normal
React re-renders, drawer open/close, and location updates.

### 1.5 Menu search

Menu search is collapsed by default. Clicking the search icon opens the input
and focuses it.

Search rules:

- Search text is stored lowercased in `useUiStore.menuSearch`.
- It matches `product.name` and `product.description`.
- Matching is case-insensitive and accent-sensitive.
- Category filtering runs first; search narrows the category-filtered result.
- Closing search clears the query.

If no products match the active category and search query, the menu shows the
localized empty-state message.

---

## 2. Rebrand and Presentation

### 2.1 Brand

The active brand is **BeeTee's**.

Header rules:

- The header brand uses `/images/app-icon.png`.
- The visible title is `BeeTee's`.
- The tagline is `the best of both worlds`.
- Clicking the brand returns to the menu view.

### 2.2 Theme and UI framework

The UI is built with MUI components and a custom dark BeeTee's theme in
`src/theme.ts`. Core state is managed with Zustand stores:

| Store | Responsibility |
|---|---|
| `useUiStore` | View, filters, search, toast, spinner, customizer, pending add |
| `useCartStore` | Cart lines and cart drawer state |
| `useLocationStore` | Delivery draft, saved/synced state, lookup status, location drawer |
| `useCheckoutStore` | Checkout form, validation errors, confirmed customer name |

### 2.3 Promo banner

The menu page includes a rotating promo banner with three slides:

| Promo id | Headline | Asset |
|---|---|---|
| `combo` | `Protein is never enough.` | `/images/promos/promo-combo.jpg` |
| `spicy` | `Turn up the heat.` | `/images/promos/promo-spicy.jpg` |
| `delivery` | `Free delivery over $25.` | `/images/promos/promo-delivery.jpg` |

The banner rotates every 5.5 seconds unless the user hovers/focuses it or the
browser prefers reduced motion. Dots let the user select a slide manually.

---

## 3. Store Network and Service Areas

### 3.1 Active stores

| Store ID | Display Name | Country | City | State |
|---|---|---|---|---|
| `br-londrina-higienopolis` | `BeeTee's Higienopolis` | BR | Londrina | PR |
| `br-sp-pinheiros` | `BeeTee's Pinheiros` | BR | Sao Paulo | SP |
| `us-ny-midtown` | `BeeTee's Midtown` | US | New York | NY |

Only the display names changed from `master`; ids and service areas are still
the same.

### 3.2 Store resolution

A store is matched by:

1. Country code.
2. City.
3. State.

City matching is accent-insensitive, case-insensitive, trimmed, and whitespace
normalized. State matching is canonicalized:

- Brazil uses the two-letter UF code.
- United States accepts either a two-letter state code or known full state name.

### 3.3 No cross-country matching

A Brazilian store never serves a US address, and a US store never serves a
Brazilian address.

### 3.4 No store means no delivery

If an address does not resolve to a known store, the user cannot save the
location. The app shows an alert and keeps the location drawer open.

---

## 4. Delivery Location

### 4.1 Location is required before cart customization

A user cannot customize or add a product without a valid saved delivery
location.

When the user clicks "Add to cart" without a saved location:

1. `pendingAddProductId` is set in `useUiStore`.
2. The cart drawer is closed if it is open.
3. The location drawer opens.

After the user saves a valid location, the app opens the customizer for the
pending product instead of adding it directly.

### 4.2 Valid saved location

A delivery location is considered valid only when all conditions are true:

```ts
syncedWithServer === true
delivery.zipCode.trim().length > 0
delivery.storeId.trim().length > 0
```

This logic lives in `selectHasDeliveryLocation`.

### 4.3 Draft state

Typing in the location drawer updates `useLocationStore.delivery`, clears the
lookup error, recomputes the store id from city/state/country, and marks the
delivery as not synced with the server.

The location becomes saved only after a successful `POST /api/delivery`.

### 4.4 Session persistence

Delivery data is persisted server-side per session cookie. On app mount,
`useInitialDelivery()` calls `GET /api/delivery`; if a saved delivery exists, it
hydrates the location store and sets the locale from the saved country.

### 4.5 Country selector

The location drawer country selector supports:

- `US` - United States
- `BR` - Brazil

Changing the country immediately updates the visible store list and invalidates
the synced location until the user saves again.

### 4.6 ZIP auto-lookup

The ZIP field triggers lookup on blur when the postal code has a complete shape:

| Country | Trigger |
|---|---|
| BR | Exactly 8 digits |
| US and others | Exactly 5 digits |

The manual "Look up address" button can also start lookup. If a lookup is
already in progress, additional lookup attempts are ignored.

### 4.7 Save button timing

While lookup is running, the Save button is disabled and shows a loading state.
After lookup ends, save remains disabled for 500 ms before being released.

---

## 5. Product Customization

### 5.1 Customizer opening

With a valid saved location, clicking a product's "Add to cart" button opens
`ItemCustomizerDialog`. The cart is not changed until the user clicks the
customizer's add button.

### 5.2 Customizer reset

Whenever a different product is opened, the customizer resets to:

- `pattyCount = 1`
- No selected extras
- `quantity = 1`

### 5.3 Burger patties

Only burgers expose patty selection.

| Patties | Upcharge |
|---:|---:|
| 1 | $0.00 |
| 2 | $2.00 |
| 3 | $4.00 |

The selected patty count is included in the cart customization summary.

### 5.4 Add-ons

Add-ons are category-specific:

| Category | Add-ons |
|---|---|
| Burger | Everything style, extra cheese, bacon, grilled onions, jalapenos |
| Tenders | Extra sauce, spicy dust, large pack |
| Combo | Large drink, loaded fries, extra sauce |
| Side | Large size, extra seasoning, dipping sauce |
| Drink | Large size, no ice |

Each selected add-on contributes its configured USD upcharge to the unit price.
`no-ice` is allowed and costs $0.00.

### 5.5 Customizer pricing

The customizer calculates:

```text
unit price = product.priceUsd + patty upcharge + selected add-ons
line total = unit price * quantity
```

The displayed amount uses `formatPrice`, so it follows the active locale and
currency.

### 5.6 Adding customized products

Customized products are added through `addCustomizedProduct`. Each customized
line receives a unique line id and does not merge into an existing product line,
even if the same base product was already in the cart.

---

## 6. Cart

### 6.1 Cart line shape

Cart lines are stored in `useCartStore.linesById`:

```ts
type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceUsd: number;
  customizationSummary: string[];
};
```

Plain products may use the product id as the line id. Customized products use a
generated unique line id.

### 6.2 Quantity management

Quantity actions operate on line id:

- Increment increases that line quantity by 1.
- Decrement decreases that line quantity by 1.
- If quantity reaches 0, the line is removed.
- Remove deletes the whole line regardless of quantity.

### 6.3 Cart subtotal

Subtotal is calculated from cart lines, not from the base catalog price:

```text
subtotal = sum(line.unitPriceUsd * line.quantity)
```

This is required so customized items include their add-on and patty upcharges.
No tax, delivery fee, or service fee is added.

### 6.4 Checkout blocking

The "Go to checkout" button is disabled when there are no cart lines.

If the cart has items but there is no valid saved delivery location, clicking
"Go to checkout" closes the cart drawer and opens the location drawer.

### 6.5 Checkout transition

Going to checkout closes the cart drawer, shows the page spinner, waits 750 ms,
copies the saved delivery ZIP into the checkout ZIP if the checkout field is
empty, then switches to the checkout view.

### 6.6 Cart badge

The header cart icon uses a MUI badge. It displays the current total item count,
including `0`. When the total is zero, the badge is marked `aria-hidden`.

### 6.7 Clearing cart

The cart is cleared after a valid order submission, before switching to the
confirmation view.

---

## 7. Checkout Validation

All checkout validation is client-side and runs on form submit. The first
invalid field receives focus.

### 7.1 Always required

| Field | Rule |
|---|---|
| Full name | Must not be blank |
| Email | Must contain `@`, at least one character before it, and a domain containing `.` |
| ZIP / postal code | Checkout ZIP or saved delivery ZIP must be non-empty |

### 7.2 Card fields

Card fields are required only when `paymentMethod === "card"`.

| Field | Rule |
|---|---|
| Name on card | Letters, accented letters, spaces, hyphens, apostrophes |
| Card number | 13 to 19 digits after spaces are stripped |
| Expiry | `MM / YY`, month 01-12, not expired |
| CVC | Exactly 3 or 4 digits; rendered as password input |

### 7.3 Real-time formatting

Card field formatters live in `src/checkout/formatters.ts`.

| Field | Formatting |
|---|---|
| Name on card | Removes unsupported characters |
| Card number | Keeps 16 digits max, groups as `XXXX XXXX XXXX XXXX` |
| Expiry | Keeps 4 digits max, displays as `MM / YY` |
| CVC | Keeps 4 digits max |

### 7.4 Payment methods

Two payment methods exist:

- `card` (default)
- `pay-in-restaurant`

Switching to `pay-in-restaurant` immediately clears card-field validation
errors.

### 7.5 Error display and focus order

Errors are stored in `useCheckoutStore.errors` and displayed as MUI `TextField`
helper text.

Focus order:

```text
fullName -> email -> zipCode -> cardNameOnCard -> cardNumber -> cardExpiry -> cardCvc
```

---

## 8. Tips and Donations

### 8.1 Tip presets

The order summary offers four mutually exclusive tip choices:

| Label | Stored value |
|---|---:|
| No tip | 0 |
| 10% | 10 |
| 15% | 15 |
| 20% | 20 |

Tip amount is calculated from the items subtotal before donation:

```text
tip amount = subtotal * tipPercent / 100
```

### 8.2 Donation beneficiary

The beneficiary is `Associacao de doacoes Teste` in business meaning, defined in
code as `DONATION_ASSOCIATION`.

### 8.3 Donation modes

Only one donation mode can be active at a time:

- `none`
- `fixed`
- `percent`

Default is `none`.

### 8.4 Donation presets

| Fixed presets | Percent presets |
|---|---|
| 1, 2, 5 currency units | 1%, 2%, 5% |

Fixed preset values are stored internally as USD and displayed through
`formatPrice`.

### 8.5 Custom donation

Custom fixed donation values are typed in the active display currency and
converted back to USD with `fromDisplayPrice`.

Custom percent donation values are stored as percentages and are not currency
converted.

If the custom value is empty, invalid, or not greater than zero, donation resets
to `none`.

### 8.6 Grand total

The checkout grand total is:

```text
subtotal + tip amount + donation amount
```

---

## 9. Order Placement

### 9.1 Delivery data is read-only in checkout

Checkout displays the saved delivery address in disabled fields. The user cannot
edit delivery from checkout; they must return to the menu and use the location
drawer.

### 9.2 Successful submission

When validation passes:

1. `confirmedUserName` is set from the trimmed full name.
2. The cart is cleared.
3. The view changes to `confirmation`.

### 9.3 Confirmation page

The confirmation page shows:

- Personalized localized greeting.
- Success icon.
- Fixed ETA of `30 min`.
- Saved delivery address.
- Fulfilling store name when available.
- Back-to-menu button.

The ETA is a demo constant and is not calculated dynamically.

---

## 10. Navigation and UI State

### 10.1 Views

The app has three views:

| View | Meaning |
|---|---|
| `shop` | Menu/home screen |
| `checkout` | Checkout form |
| `confirmation` | Order confirmation |

View state lives in `useUiStore.view`.

### 10.2 Header home action

Clicking the header brand:

- Clears checkout validation errors.
- Closes the cart drawer.
- Closes the location drawer.
- Navigates to `shop`.

### 10.3 Back to menu from checkout

The checkout back button clears checkout validation errors, closes drawers, and
returns to `shop`.

### 10.4 Confirmation back action

The confirmation page back button returns to `shop`.

### 10.5 Escape key

Escape closes only one surface per key press:

1. Location drawer first, if open.
2. Otherwise cart drawer, if open.

Closing the location drawer also clears any pending add product id.

### 10.6 Drawer exclusivity

Opening the location drawer closes the cart drawer. Opening the cart drawer
closes the location drawer.

### 10.7 Toast

After a product is added from the customizer, a localized toast appears with the
product name. Repeated adds increment `toastVersion`, allowing the toast timer
to restart even if the item name is the same.

---

## 11. Address Geocoding

### 11.1 API endpoints

The React app calls:

- `GET /api/geocode?postalCode=...&countryCode=...`
- `GET /api/delivery`
- `POST /api/delivery`

All calls include credentials so the session cookie is preserved.

### 11.2 Providers

| Country | Primary | Fallback |
|---|---|---|
| BR | ViaCEP | Nominatim |
| Others | Nominatim | None |

ViaCEP is preferred for Brazil. Nominatim remains keyless and uses a configured
User-Agent.

### 11.3 Postal code normalization

Server-side postal rules remain:

- Brazil uses 8 digits for lookup and may display as `XXXXX-XXX`.
- US ZIP+4 is reduced to the first 5 digits.

### 11.4 Lookup result

A successful lookup applies geocoded fields to the location draft and recomputes
`storeId`. If the recomputed store id exists, the locale is set from the
selected country.

If lookup fails, `lookupError` is shown in the drawer and no delivery is saved.

---

## 12. Dynamic Translation and Currency

### 12.1 Supported locales

| Country | Locale | Currency |
|---|---|---|
| US | `en-US` | USD |
| BR | `pt-BR` | BRL |

The default locale is `en-US`.

### 12.2 Locale switching

The locale switches when a lookup or saved delivery resolves to a country:

- `BR` sets `pt-BR`.
- Any other supported country sets `en-US`.

Looking up a city that has no matching store does not save a delivery and should
not be treated as a valid delivery location.

### 12.3 Translation scope

User-visible UI strings are routed through `t(key, vars)` for:

- Category filter.
- Menu and search.
- Product customizer.
- Cart drawer.
- Checkout.
- Tip and donation sections.
- Confirmation page.
- Location drawer.
- Header ARIA labels.
- Toast text.

### 12.4 Currency formatting

Amounts are stored in USD. `formatPrice(usd)` displays:

- USD for `en-US`.
- BRL for `pt-BR`, using a fixed training conversion of `USD * 5.7`.

This is a demo conversion, not a live exchange rate.

### 12.5 Display-to-USD conversion

`fromDisplayPrice(localAmount)` converts user-entered local currency back to USD
for fixed donation input:

```text
pt-BR: localAmount / 5.7
en-US: localAmount
```

---

## 13. Automated Test Structure

### 13.1 Location

Playwright specs now live under `playwright/tests`. Shared fixtures and helpers
live under `playwright/helpers`, and test data lives under `playwright/data`.

### 13.2 Page Object Model

The branch added POM classes under `playwright/pages`, including:

- `app.ts`
- `header.ts`
- `menuPage.ts`
- `cartDrawer.ts`
- `checkoutPage.ts`
- `locationDrawer.ts`

New tests should prefer these page objects for reusable flows.

### 13.3 Commands

The package scripts are:

```json
{
  "dev": "vite",
  "server": "node server/index.mjs",
  "dev:all": "concurrently -k \"npm run server\" \"npm run dev\"",
  "build": "tsc && vite build",
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:headed": "playwright test --headed",
  "test:report": "playwright show-report"
}
```

---

*Last updated: May 2026 - BeeTee's React migration branch.*
