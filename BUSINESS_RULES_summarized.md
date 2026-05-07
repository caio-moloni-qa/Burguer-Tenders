Burguer-Tenders — Business Rules (compact)
1. Catalog
Static, 16 items in src/data/products.ts. No backend.
Categories: burger | tenders | combo | drink | side.
Product shape: id, name, shortName, description, imageSrc, priceUsd, category, spicy.
spicy:true → "SPICY" badge (uppercase). Items: bt-special, pack-tenders-spicy, combo-spicy-milkshake.
Prices stored USD number, formatted via Intl.NumberFormat (locale-aware, see §10).
Filter <select>: All/Burgers/Tenders/Combos/Drinks/Sides. Persists in module-level activeFilter (src/ui/menu.ts).
2. Stores
id	name	cc	city/state
br-londrina-higienopolis
BT Higienopolis
BR
Londrina/PR
br-sp-pinheiros
BT Pinheiros
BR
São Paulo/SP
us-ny-midtown
BT Midtown
US
New York/NY
Match: cc + city + state, accent/case-insensitive (normalizeCity NFD strip).
BR=2-letter UF. US Nominatim names mapped via US_STATE_NAME_TO_CODE → 2-letter.
No cross-country matching.
No store → window.alert(...), panel stays open, save blocked.
3. Delivery Location
hasDeliveryLocation() = deliverySyncedWithServer && zipCode && storeId (all 3).
Add-to-cart w/o location → opens panel, stores pendingAddProductId.
After save w/ pending → auto-add + toast.
Typing → draft, sets deliverySyncedWithServer=false. Valid only after POST /api/delivery.
ZIP focusout auto-lookup if BR=8 / US=5 digits — suppressed if focus → [data-action='lookup-address'] (race guard).
Persisted server-side via session cookie bt_sid. GET /api/delivery rehydrates on load.
Country <select> re-renders store list immediately.
Checkout: empty checkout ZIP falls back to saved delivery ZIP.
4. Cart
Add/＋: +1. −: -1, removes line at 0. Remove: deletes regardless.
Drawer-open mutations use addProductSilent / setQuantitySilent / removeLineSilent + patchCartDOM() (patches body lines, footer, header badge — no emit()).
Emitting variants used by clear() only (post-order).
clear() runs before setView("confirmation").
Checkout button disabled if empty cart.
"Go-checkout" w/o location → opens panel.
Subtotal = Σ priceUsd × quantity. No taxes/fees.
5. Checkout Validation
Client-side on submit, focuses first invalid field.

Always required: fullName (non-blank), email (@ w/ ≥1 char before, domain w/ .), ZIP (checkout or saved).

Card (when paymentMethod==="card"):

field	rule
cardNameOnCard
/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/
cardNumber
13–19 digits (spaces stripped); auto XXXX XXXX XXXX XXXX, capped 16
cardExpiry
MM / YY, month 01–12, not past (valid through end of month)
cardCvc
^\d{3,4}$, type=password
Real-time formatting on input: in-place el.value, no re-render.
2 payment methods: card (default) | pay-in-restaurant. Switching to restaurant clears card errors.
Errors: inline msg + red border/bg; cleared as user types.
Focus order: fullName → email → zipCode → cardNameOnCard → cardNumber → cardExpiry → cardCvc.
6. Order Placement
Checkout shows delivery address read-only (must edit via location panel).
ETA fixed = 30 min.
Confirmation: greeting "Thank you, [Name]!", green check, ETA pill, store name + address block.
Cart cleared before confirmation render.
7. Navigation
3 views: shop | checkout | confirmation.
Header brand = data-action="go-home" → returns to shop, clears errors/drawers/pendingAddProductId.
Go-checkout: 750ms spinner overlay.
Escape: closes location panel first, else cart drawer (one press, one action).
Mutual exclusivity: opening cart closes location panel & vice versa.
8. Geocoding
BR primary: ViaCEP; fallback Nominatim. Others: Nominatim only.
BR Nominatim retry: 5 query shapes, 350ms delays (≈1 req/s):
{postalcode:normalized,cc:br}, {postalcode:digits,cc:br}, q:"<digits>, Brasil", q:"<normalized>, Brasil", q:digits.
ZIP normalization: BR → XXXXX-XXX display / 8-digit lookup. US → strip -XXXX to 5.
Auto-trigger thresholds: BR=8, US=5. Manual button always works.
No API key. Nominatim needs User-Agent (NOMINATIM_USER_AGENT env).
9. UI Feedback
Add-to-cart toast: 2.5s + 350ms fade. Re-add resets timer & updates msg.
Store banner above grid when storeId set (independent of full hasDeliveryLocation).
Location status:
no city/state → "Enter your ZIP and use Look up address…"
resolved, no store → "We don't deliver to this city yet."
matched → "Delivery available from [Store]"
Lookup btn: disabled=true, label "Looking up…" via direct DOM mutation.
No-rerender strategies:
trigger	strategy
typing in location panel
clearLookupErrorSilent()
typing in card/checkout
direct checkoutForm mutation
cart mutations w/ drawer open
silent + patchCartDOM()
typing in donation custom
patchDonationSummary(cart)
country change
emitLocationChange() (deliberate)
lookup completion
emitLocationChange()
Cart badge: yellow, hidden when empty, updated by patchCartDOM().
Favicon: public/favicon.svg.
Empty grid: <p class="menu__empty">No items in this category yet.</p>.
10. i18n
Locales: en-US/USD (US), pt-BR/BRL (BR). Source: src/i18n/locale.ts.
Trigger: lookup success that resolves to known store → setLocale(cc) + emitLocationChange(). No store → no locale change.
Session restore: if d.countryCode, setLocale before first render().
Scope: every visible string via t(key, vars?). Areas: menu, search, cart, checkout, tip, donation, confirmation, location, toast, header ARIA.
formatPrice(usd): BR → usd × 5.7 BRL (USD_TO_BRL=5.7, demo), else USD.
Placeholders {name} {item} {store} {time} replaced by vars.
Country <select> change → only patchLocationCountryDOM (locale unchanged until lookup).
11. Menu Search
Input row below filter toolbar, always visible.
Matches name | description, lowercased, accent-sensitive.
Composes w/ category filter (category first, then search).
State: module-level menuSearchQuery (src/ui/menu.ts), survives re-renders.
input event → setMenuSearch + render().
Caret preserved across render() via getInputFocusSnapshot / restoreInputFocus.
Empty state: same menu__empty placeholder.
12. Tip
Buttons: No tip / 10 / 15 / 20 → tipPercent: 0|10|15|20. Default 0.
Stored on checkoutForm, survives navigation.
tipAmount = subtotal × tipPercent / 100.
Summary rows: Subtotal (always), Tip (X%) (if >0), Total = subtotal+tip+donation. testids: checkout-subtotal, checkout-tip-amount, checkout-total.
data-action="set-tip" + data-tip-percent; full re-render only if view=checkout.
13. Donation
Beneficiary: DONATION_ASSOCIATION = "Associação de doações Teste".
Modes (mutually exclusive): none (default) | fixed | percent.
Presets: DONATION_FIXED_OPTIONS=[1,2,5] USD; DONATION_PERCENT_OPTIONS=[1,2,5]%.
Custom inputs:
fixed: typed in display currency, stored USD via fromDisplayPrice() (BRL → /5.7).
percent: stored as-is, % suffix.
Selecting one mode deactivates other. "No donation" resets all 4 fields.
Preset highlight ⇔ donationType==group && donationAmount==value && customField==="".
donationAmount = fixed?amount : percent? subtotal*amount/100 : 0.
Grand Total = Subtotal + Tip + Donation (in checkout-total).
Custom typing → patchDonationSummary(cart) (no <input> replacement → caret preserved).
State on checkoutForm: donationType, donationAmount(USD), donationCustomFixed, donationCustomPercent.