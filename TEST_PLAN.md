# Burguer-Tenders — Playwright Test Plan

> **Base URL:** `http://localhost:5173`  
> **API:** `http://localhost:3001` (proxied through Vite at `/api`)  
> **Pre-requisite:** `npm run dev:all` must be running before any suite executes.  
> **Session isolation:** Each suite (or each test where noted) should start with a fresh browser context (cleared cookies/storage) so the session delivery state is clean.

---

## Table of Contents

1. [Suite 01 — Product Catalog](#suite-01--product-catalog)
2. [Suite 02 — Category Filter](#suite-02--category-filter)
3. [Suite 03 — Delivery Location Panel](#suite-03--delivery-location-panel)
4. [Suite 04 — Address Geocoding & Store Resolution](#suite-04--address-geocoding--store-resolution)
5. [Suite 05 — Cart Behaviour](#suite-05--cart-behaviour)
6. [Suite 06 — Checkout Form Validation](#suite-06--checkout-form-validation)
7. [Suite 07 — Order Placement & Confirmation](#suite-07--order-placement--confirmation)
8. [Suite 08 — Navigation & Views](#suite-08--navigation--views)
9. [Suite 09 — UI Feedback & Panels](#suite-09--ui-feedback--panels)

---

## Suite 01 — Product Catalog

> **Goal:** Verify that the full catalog is rendered correctly on the shop page.

---

### TC-01-01 — All 16 products are displayed on page load

**Preconditions:** Fresh session, no delivery location set.  
**Steps:**
1. Navigate to `/`.
2. Count all `[data-testid="product-image"]` elements inside `[data-testid="product-grid"]`.

**Expected:** Exactly **16** product cards are rendered.

---

### TC-01-02 — Each product card shows name, description, price and image

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Pick any product card (e.g. Cheeseburguer).
3. Assert the card contains: a non-empty heading, a non-empty description paragraph, a price matching `$X.XX` format, and an `<img>` with a non-empty `src`.

**Expected:** All four elements are present and non-empty for every card.

---

### TC-01-03 — Spicy badge appears only on spicy products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Collect all `.product-card__badge` elements (text "Spicy").
3. Assert they belong to exactly: `bt-special`, `pack-tenders-spicy`, `combo-spicy-milkshake`.

**Expected:** Exactly 3 spicy badges, on the correct products.

---

### TC-01-04 — Non-spicy products have no badge

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. For each product card **without** `data-product-id` in `["bt-special","pack-tenders-spicy","combo-spicy-milkshake"]`, assert `.product-card__badge` is absent.

**Expected:** 13 cards have no spicy badge.

---

### TC-01-05 — Prices are formatted in USD

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Collect all `.product-card__price` text values.
3. Assert each matches the regex `/^\$\d+\.\d{2}$/`.

**Expected:** All 16 prices match USD currency format.

---

## Suite 02 — Category Filter

> **Goal:** Verify the category dropdown correctly filters the product grid.

---

### TC-02-01 — Default filter is "All" and shows all 16 products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Read the value of `[data-testid="menu-category-filter"]`.
3. Count product cards.

**Expected:** Select value is `"all"`, card count is **16**.

---

### TC-02-02 — Filtering by "Burgers" shows exactly 4 products

**Preconditions:** Fresh session.  
**Steps:**
1. Navigate to `/`.
2. Select `"burger"` in `[data-testid="menu-category-filter"]`.
3. Count product cards.

**Expected:** **4** cards — Cheeseburguer, Cheeseburguer Bacon, Avocado Burguer, BT Special.

---

### TC-02-03 — Filtering by "Tenders" shows exactly 2 products

**Steps:** Select `"tenders"`. **Expected:** **2** cards.

---

### TC-02-04 — Filtering by "Combos" shows exactly 4 products

**Steps:** Select `"combo"`. **Expected:** **4** cards.

---

### TC-02-05 — Filtering by "Drinks" shows exactly 2 products

**Steps:** Select `"drink"`. **Expected:** **2** cards — Doctor BT, Guaraná.

---

### TC-02-06 — Filtering by "Sides" shows exactly 4 products

**Steps:** Select `"side"`. **Expected:** **4** cards — Plain Fries, Lemon Pepper Fries, Chocolate Milkshake, Strawberry Milkshake.

---

### TC-02-07 — Filter persists after switching back to "All"

**Steps:**
1. Select `"burger"`.
2. Select `"all"`.
3. Count cards.

**Expected:** **16** cards.

---

### TC-02-08 — Filter selection persists across cart state changes

**Preconditions:** Delivery location already saved (Londrina or SP ZIP).  
**Steps:**
1. Navigate to `/`.
2. Select `"drink"` — confirm 2 cards.
3. Open cart drawer and close it.
4. Assert filter is still `"drink"` and card count is still **2**.

**Expected:** Filter state survives panel open/close re-renders.

---

## Suite 03 — Delivery Location Panel

> **Goal:** Verify the location panel opens, closes, and handles all interaction states correctly.

---

### TC-03-01 — Location panel opens on clicking the pin icon

**Steps:**
1. Navigate to `/`.
2. Click `[data-testid="location-toggle"]`.

**Expected:** `[data-testid="location-panel"]` is visible.

---

### TC-03-02 — Location panel closes on X button

**Steps:**
1. Open location panel.
2. Click the close button (×) inside the panel.

**Expected:** Panel is hidden/removed.

---

### TC-03-03 — Location panel closes on backdrop click

**Steps:**
1. Open location panel.
2. Click `.location-backdrop`.

**Expected:** Panel is hidden.

---

### TC-03-04 — Location panel closes on Escape key

**Steps:**
1. Open location panel.
2. Press `Escape`.

**Expected:** Panel is hidden.

---

### TC-03-05 — Only one panel open at a time — cart closes when location opens

**Preconditions:** Delivery location saved.  
**Steps:**
1. Open cart drawer.
2. Click the location pin icon.

**Expected:** Cart drawer is closed; location panel is open.

---

### TC-03-06 — Only one panel open at a time — location closes when cart opens

**Preconditions:** Delivery location saved.  
**Steps:**
1. Open location panel.
2. Click the cart icon.

**Expected:** Location panel is closed; cart drawer is open.

---

### TC-03-07 — Country selector changes the store list

**Steps:**
1. Open location panel.
2. Assert store list contains "Burguer-Tenders Higienopolis" (BR default).
3. Change `[data-testid="location-country"]` to `"US"`.
4. Assert store list now contains "Burguer-Tenders Midtown".

**Expected:** Store list updates on country change.

---

### TC-03-08 — Typing in location inputs does not re-render the panel

**Steps:**
1. Open location panel.
2. Focus the ZIP input `[data-testid="location-zip"]`.
3. Type several characters.
4. Assert the ZIP input remains focused throughout (no focus loss).

**Expected:** Panel does not re-render; cursor stays in input.

---

### TC-03-09 — Cannot save location without a deliverable address

**Steps:**
1. Open location panel.
2. Manually type a ZIP (`99999`) that cannot be resolved.
3. Click `[data-testid="location-save"]`.

**Expected:** A browser alert is shown mentioning delivery areas; panel stays open; no store banner appears.

---

### TC-03-10 — Location summary appears in header after save

**Preconditions:** Use Londrina ZIP `86015280`.  
**Steps:**
1. Open location panel, select BR, type `86015280`.
2. Click "Look up address" — wait for fields to populate.
3. Click "Save location".

**Expected:** `[data-testid="location-summary"]` is visible in the header with city/ZIP info.

---

## Suite 04 — Address Geocoding & Store Resolution

> **Goal:** Verify postal code lookup and store matching logic for all supported areas.

---

### TC-04-01 — Londrina BR ZIP resolves to Burguer-Tenders Higienopolis

**ZIP:** `86015280` | **Country:** BR  
**Steps:**
1. Open location panel, set country to BR, type ZIP, click "Look up address".
2. Wait for `[data-testid="location-store-status"]` to update.

**Expected:** Status text contains "Burguer-Tenders Higienopolis".

---

### TC-04-02 — São Paulo BR ZIP resolves to Burguer-Tenders Pinheiros

**ZIP:** `05413010` | **Country:** BR  
**Steps:** Same as TC-04-01.

**Expected:** Status text contains "Burguer-Tenders Pinheiros".

---

### TC-04-03 — New York US ZIP resolves to Burguer-Tenders Midtown

**ZIP:** `10001` | **Country:** US  
**Steps:** Same as TC-04-01 with country set to US.

**Expected:** Status text contains "Burguer-Tenders Midtown".

---

### TC-04-04 — Unknown city ZIP shows "We don't deliver to this city yet"

**ZIP:** A valid Brazilian ZIP outside Londrina/SP (e.g. `01310100` — São Paulo central would match, so use a city not in the list such as Curitiba `80010010`).  
**Steps:** Look up a ZIP for an unsupported city.

**Expected:** Status text contains "We don't deliver to this city yet".

---

### TC-04-05 — Address fields are populated after a successful lookup

**ZIP:** `86015280` | **Country:** BR  
**Steps:**
1. Look up address.
2. Assert `[data-testid="location-street"]`, `[data-testid="location-city"]`, `[data-testid="location-state"]` all have non-empty values.

**Expected:** All address fields are populated.

---

### TC-04-06 — "Look up address" button is disabled while request is in flight

**Steps:**
1. Open location panel, type a valid ZIP.
2. Click "Look up address".
3. Immediately assert `[data-testid="location-lookup"]` is disabled and contains "Looking up…".

**Expected:** Button is disabled during the request.

---

### TC-04-07 — "Look up address" button does not cause panel re-render

**Steps:**
1. Open location panel, focus the complement field, type text.
2. Move focus back, type a valid ZIP.
3. Click "Look up address", wait for completion.
4. Assert complement field still shows the value typed in step 1.

**Expected:** Complement input value is preserved (no full re-render wiped it).

---

### TC-04-08 — Saving a valid location persists across page reload

**Steps:**
1. Save a valid location (e.g. Londrina ZIP).
2. Reload the page.
3. Assert `[data-testid="location-summary"]` is still visible.

**Expected:** Session cookie restores the saved address.

---

## Suite 05 — Cart Behaviour

> **Goal:** Verify all cart interactions, quantity rules, and the no-re-render behaviour.

---

### TC-05-01 — Clicking "Add to cart" without a location opens the location panel

**Preconditions:** Fresh session, no delivery location.  
**Steps:**
1. Navigate to `/`.
2. Click `[data-testid="add-to-cart"]` on any product.

**Expected:** `[data-testid="location-panel"]` opens; cart drawer does NOT open.

---

### TC-05-02 — After saving location, the pending product is added automatically

**Steps:**
1. Fresh session. Click "Add to cart" on Cheeseburguer (location panel opens).
2. Set and save a valid location.

**Expected:** Cart badge shows **1**; toast shows "Cheeseburguer was successfully added to cart!".

---

### TC-05-03 — Cart badge shows correct item count

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer (qty 1) and Pack of tenders (qty 1).
2. Read `[data-testid="cart-count"]`.

**Expected:** Badge text is `"2"`.

---

### TC-05-04 — Cart drawer opens and closes

**Preconditions:** Location saved.  
**Steps:**
1. Click cart icon to open.
2. Assert `[data-testid="cart-drawer"]` is visible.
3. Click the × close button.
4. Assert drawer is hidden.

**Expected:** Drawer opens and closes correctly.

---

### TC-05-05 — Added products appear in the cart drawer

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer.
2. Open cart drawer.
3. Assert `[data-testid="cart-lines"]` contains "Cheeseburguer".

**Expected:** Product name appears in the cart line.

---

### TC-05-06 — Incrementing quantity updates the line count

**Preconditions:** Location saved; Cheeseburguer in cart.  
**Steps:**
1. Open cart.
2. Click `[data-action="inc-line"]` for Cheeseburguer.
3. Read `[data-testid="cart-line-qty"]`.

**Expected:** Quantity is **2**.

---

### TC-05-07 — Decrementing to zero removes the line

**Preconditions:** Location saved; Cheeseburguer in cart with quantity 1.  
**Steps:**
1. Open cart.
2. Click `[data-action="dec-line"]`.
3. Assert the Cheeseburguer line is gone.

**Expected:** Cart shows "Your cart is empty."

---

### TC-05-08 — Remove button deletes the line immediately

**Preconditions:** Location saved; two items in cart.  
**Steps:**
1. Open cart.
2. Click `[data-action="remove-line"]` on the first item.
3. Assert that line no longer appears.

**Expected:** Line is removed; the other item remains.

---

### TC-05-09 — Subtotal is calculated correctly

**Preconditions:** Location saved.  
**Steps:**
1. Add 2× Cheeseburguer ($3.49) and 1× Pack of tenders ($6.99).
2. Open cart.
3. Read `[data-testid="cart-subtotal"]`.

**Expected:** Subtotal = `$13.97`.

---

### TC-05-10 — "Go to checkout" is disabled when cart is empty

**Preconditions:** Location saved; cart is empty.  
**Steps:**
1. Open cart.
2. Assert `[data-testid="go-checkout"]` has `disabled` attribute.

**Expected:** Button is disabled.

---

### TC-05-11 — Cart drawer does NOT fully re-render when adding/removing items

**Preconditions:** Location saved; cart drawer open.  
**Steps:**
1. Focus the cart drawer's close button (or note the scroll position of the drawer body).
2. Click `[data-action="inc-line"]` on a cart line.
3. Assert the cart drawer `<aside>` element is the **same DOM node** (no full innerHTML replacement).

**Expected:** The drawer body updates in-place; no full re-render occurs (testable via `page.evaluate` checking element identity or absence of re-mount).

---

### TC-05-12 — Cart badge updates without full page re-render

**Preconditions:** Location saved; 1 item in cart.  
**Steps:**
1. Add another product via "Add to cart" from the product grid.
2. Immediately read `[data-testid="cart-count"]`.

**Expected:** Badge updates to the new count without a visible page flash.

---

## Suite 06 — Checkout Form Validation

> **Goal:** Verify all form field rules — required fields, format rules, and real-time formatting.

**Preconditions for all TC-06-xx:** Valid delivery location saved; at least one item in cart; user has navigated to the checkout page.

---

### TC-06-01 — Submitting with all fields empty shows errors

**Steps:**
1. Clear all fields.
2. Click `[data-testid="place-order"]`.

**Expected:** Error messages appear for: `fullName`, `email`, `cardNameOnCard`, `cardNumber`, `cardExpiry`, `cardCvc`.

---

### TC-06-02 — Full name is required

**Steps:** Leave name blank, fill all other fields correctly, submit.

**Expected:** `[data-testid="checkout-error-fullName"]` is visible.

---

### TC-06-03 — Email must contain "@" and a domain with a dot

**Steps:**
1. Enter `"notanemail"` → submit → assert error.
2. Enter `"user@"` → submit → assert error.
3. Enter `"user@domain"` (no dot) → submit → assert error.
4. Enter `"user@domain.com"` → assert no email error.

**Expected:** Invalid formats produce an error; valid format clears it.

---

### TC-06-04 — Card name rejects digits

**Steps:** Type `"John123"` into name-on-card field.

**Expected:** The `"1"`, `"2"`, `"3"` characters are stripped in real-time; field shows `"John"`.

---

### TC-06-05 — Card name rejects special characters

**Steps:** Type `"John@#$"`.

**Expected:** `"@"`, `"#"`, `"$"` are stripped; field retains `"John"`.

---

### TC-06-06 — Card name allows letters, spaces, hyphens and apostrophes

**Steps:** Type `"Mary-Jane O'Brien"`.

**Expected:** Full value is preserved without any stripping.

---

### TC-06-07 — Card number auto-formats as XXXX XXXX XXXX XXXX

**Steps:** Type `"1234567890123456"` into the card number field.

**Expected:** Field value becomes `"1234 5678 9012 3456"`.

---

### TC-06-08 — Card number accepts only digits

**Steps:** Type `"1234-ABCD-5678"`.

**Expected:** Non-digit characters are stripped; value becomes `"1234 5678"`.

---

### TC-06-09 — Card number with fewer than 13 digits fails validation

**Steps:** Enter `"1234 5678"` (8 digits), submit.

**Expected:** Error on `cardNumber` field.

---

### TC-06-10 — Expiry auto-formats as MM / YY

**Steps:** Type `"1228"` into the expiry field.

**Expected:** Field value becomes `"12 / 28"`.

---

### TC-06-11 — Expiry with invalid month (e.g. 13) fails validation

**Steps:** Type `"1328"` (month 13).

**Expected:** Expiry error on submit.

---

### TC-06-12 — Expired card date fails validation

**Steps:** Enter a past date such as `"01 / 20"` (January 2020).

**Expected:** Error: "Enter a valid expiry date … that hasn't passed."

---

### TC-06-13 — CVC rejects letters and special chars

**Steps:** Type `"12A!"` into the CVC field.

**Expected:** Value becomes `"12"` (only digits retained).

---

### TC-06-14 — CVC with 2 digits fails validation

**Steps:** Enter `"12"`, submit.

**Expected:** CVC error: "Security code must be 3 or 4 digits."

---

### TC-06-15 — CVC is rendered as a password field (masked)

**Steps:** Inspect the CVC input type.

**Expected:** `input[id="checkout-card-cvc"]` has `type="password"`.

---

### TC-06-16 — Selecting "Pay in restaurant" hides card fields and skips card validation

**Steps:**
1. Select the "Pay in restaurant" radio.
2. Submit with name and email filled but all card fields empty.

**Expected:** No card field errors; order proceeds.

---

### TC-06-17 — Switching to "Pay in restaurant" clears existing card errors

**Steps:**
1. Submit with card method and empty card fields (errors appear).
2. Switch to "Pay in restaurant".

**Expected:** Card error messages disappear immediately.

---

### TC-06-18 — First invalid field receives focus on submit

**Steps:**
1. Leave all fields empty.
2. Click "Place order".

**Expected:** Focus lands on `[id="checkout-name"]` (first field in error).

---

### TC-06-19 — Errors clear field-by-field as user corrects them

**Steps:**
1. Submit empty form (errors appear).
2. Type a name into the name field.

**Expected:** `[data-testid="checkout-error-fullName"]` disappears; other errors remain.

---

## Suite 07 — Order Placement & Confirmation

---

### TC-07-01 — Valid form submission navigates to confirmation page

**Preconditions:** Location saved, items in cart.  
**Steps:**
1. Fill all checkout fields correctly (card method, future expiry, 3-digit CVC).
2. Click "Place order".

**Expected:** Confirmation page is shown (`[data-testid]` or heading "Thank you").

---

### TC-07-02 — Confirmation shows personalised greeting

**Steps:** After placing order with name `"Alice"`.

**Expected:** Page contains "Thank you, Alice!".

---

### TC-07-03 — Confirmation shows "Your order is placed!"

**Expected:** Page contains the text "Your order is placed!".

---

### TC-07-04 — Confirmation shows 30-minute ETA

**Expected:** Page contains "30 min".

---

### TC-07-05 — Confirmation shows full delivery address

**Expected:** Page contains: ZIP, street address, neighborhood, city/state, country.

---

### TC-07-06 — Confirmation shows the store name

**Expected:** Page contains the store name (e.g. "Burguer-Tenders Pinheiros").

---

### TC-07-07 — Cart is empty after order placement

**Steps:** After confirmation, click "Back to menu", open cart drawer.

**Expected:** Cart shows "Your cart is empty." and badge is hidden.

---

### TC-07-08 — "Back to menu" on confirmation returns to the shop view

**Steps:** Click the "Back to menu" button on the confirmation page.

**Expected:** Product grid is visible; view is `shop`.

---

## Suite 08 — Navigation & Views

---

### TC-08-01 — App starts on the shop view

**Steps:** Navigate to `/`.

**Expected:** `[data-testid="product-grid"]` is visible.

---

### TC-08-02 — "Go to checkout" shows a 750ms full-screen spinner

**Preconditions:** Location saved; cart non-empty.  
**Steps:**
1. Open cart, click `[data-testid="go-checkout"]`.
2. Immediately assert `.page-spinner-overlay` is visible.
3. Wait 800ms and assert overlay is gone and checkout form is visible.

**Expected:** Spinner overlay appears then disappears; checkout page renders.

---

### TC-08-03 — Header logo returns to shop from checkout

**Steps:**
1. Navigate to checkout.
2. Click `[data-testid="site-logo"]` (or the brand button).

**Expected:** Product grid is visible; URL is `/` (or the SPA shop state is restored).

---

### TC-08-04 — Header logo returns to shop from confirmation

**Steps:**
1. Complete an order (confirmation page).
2. Click the header logo.

**Expected:** Product grid is visible.

---

### TC-08-05 — "← Back to menu" on checkout returns to shop

**Steps:**
1. Navigate to checkout.
2. Click `[data-testid="back-to-shop"]`.

**Expected:** Product grid is visible.

---

### TC-08-06 — Escape key closes the location panel

**Steps:**
1. Open location panel.
2. Press `Escape`.

**Expected:** Panel closes.

---

### TC-08-07 — Escape key closes the cart drawer

**Preconditions:** Location saved.  
**Steps:**
1. Open cart drawer.
2. Press `Escape`.

**Expected:** Cart drawer closes.

---

### TC-08-08 — Escape closes location panel before cart (priority order)

**Steps:**
1. Open location panel.
2. Press `Escape` — panel closes.
3. Press `Escape` again — cart (if open) would close, but panel was priority.

**Expected:** Location panel closes on first Escape; a second Escape closes any other open panel.

---

## Suite 09 — UI Feedback & Panels

---

### TC-09-01 — Add-to-cart toast appears with correct message

**Preconditions:** Location saved.  
**Steps:**
1. Click "Add to cart" on Cheeseburguer.
2. Assert `[data-testid="cart-toast"]` is visible.
3. Assert its text contains `"Cheeseburguer was successfully added to cart!"`.

**Expected:** Toast visible with correct item name.

---

### TC-09-02 — Toast auto-hides after ~2.5 seconds

**Steps:**
1. Add a product.
2. Wait 3 seconds.
3. Assert toast is no longer visible.

**Expected:** Toast is gone after 2.5s + 350ms fade.

---

### TC-09-03 — Toast resets timer if another item is added while visible

**Steps:**
1. Add Cheeseburguer — note timestamp.
2. After 1 second, add Pack of tenders.
3. Assert toast is still visible at the 3-second mark (would have hidden if timer wasn't reset).

**Expected:** Toast stays visible beyond 2.5s from first add, hiding ~2.5s after the second add.

---

### TC-09-04 — Store banner appears after a valid location is saved

**Preconditions:** Fresh session.  
**Steps:**
1. Save a valid location (e.g. SP ZIP).
2. Assert `[data-testid="menu-store-banner"]` is visible.
3. Assert it contains "Burguer-Tenders Pinheiros".

**Expected:** Banner shows correct store name.

---

### TC-09-05 — Store banner is not shown before a location is saved

**Preconditions:** Fresh session, no location saved.

**Expected:** `[data-testid="menu-store-banner"]` does not exist in the DOM.

---

### TC-09-06 — Location panel does not re-render while typing in address fields

**Steps:**
1. Open location panel.
2. Click into the street address field.
3. Type a long string (e.g. "123 Main Street").
4. Assert focus never left the field (no `focusout` events were fired back to the input).
5. Assert the full string is present in the input.

**Expected:** No re-render; all characters retained; focus stays in field.

---

### TC-09-07 — Location pin badge indicates location is set

**Preconditions:** Valid location saved.

**Expected:** `.header-location__badge--visible` class is present on the pin badge.

---

### TC-09-08 — Location pin badge is not shown before location is saved

**Preconditions:** Fresh session.

**Expected:** `.header-location__badge--visible` class is absent.

---

### TC-09-09 — Cart badge is hidden when cart is empty

**Preconditions:** Location saved; empty cart.

**Expected:** `[data-testid="cart-count"]` does not have class `header-cart__badge--visible` (or is visually hidden).

---

### TC-09-10 — Cart badge shows correct count after adding multiple different products

**Preconditions:** Location saved.  
**Steps:**
1. Add Cheeseburguer (1 unit).
2. Add Pack of tenders (1 unit).
3. Add Cheeseburguer again (now qty 2).

**Expected:** Badge shows `"3"` (total items, not unique lines).

---

### TC-09-11 — Checkout delivery fields are read-only

**Preconditions:** Location saved; user on checkout page.  
**Steps:**
1. Assert `[data-testid="checkout-zip"]` has `readonly` attribute.
2. Assert `[data-testid="checkout-street"]` has `readonly` attribute.

**Expected:** Delivery address inputs cannot be edited.

---

### TC-09-12 — Favicon is set to the burger SVG

**Steps:**
1. Read `document.querySelector('link[rel="icon"]').href`.

**Expected:** `href` ends with `favicon.svg`.

---

## Appendix — Test ZIPs Reference

| Country | ZIP | Expected city | Expected store |
|---|---|---|---|
| BR | `86015280` | Londrina, PR | Burguer-Tenders Higienopolis |
| BR | `05413010` | São Paulo, SP | Burguer-Tenders Pinheiros |
| US | `10001` | New York, NY | Burguer-Tenders Midtown |
| BR | `80010010` | Curitiba, PR | *(no store — delivery unavailable)* |

## Appendix — Valid Card Test Data

| Field | Value |
|---|---|
| Name on card | `Test User` |
| Card number | `4111 1111 1111 1111` |
| Expiry | `12 / 28` |
| CVC | `123` |

---

*Test plan version: April 2026 — covers all business rules in `BUSINESS_RULES.md`.*
