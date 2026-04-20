# Burguer-Tenders

A fake fast-food e-commerce SPA built with **Vite + TypeScript** (frontend) and **Express** (backend), used as a training ground for Playwright automated testing.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Application Features](#application-features)
  - [Product Catalog](#product-catalog)
  - [Category Filter](#category-filter)
  - [Delivery Location Panel](#delivery-location-panel)
  - [Cart](#cart)
  - [Checkout](#checkout)
  - [Order Confirmation](#order-confirmation)
  - [UI / UX Details](#ui--ux-details)
- [Backend API](#backend-api)
- [Automated Tests](#automated-tests)
  - [Setup](#setup)
  - [Running Tests](#running-tests)
  - [Test Suites](#test-suites)
  - [Shared Helpers](#shared-helpers)
  - [Reference Data](#reference-data)
  - [Playwright MCP (AI Agents)](#playwright-mcp-ai-agents)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite 6, TypeScript, vanilla DOM |
| Backend | Node.js, Express 4 |
| Geocoding (BR) | ViaCEP API |
| Geocoding (US/other) | Nominatim (OpenStreetMap) — no API key |
| Test runner | Playwright 1.59 (`@playwright/test`) |
| Session storage | In-memory `Map` (server-side, cookie-tracked) |

---

## Project Structure

```
burguer-tenders/
├── public/
│   ├── favicon.svg              # Burger SVG favicon
│   └── images/
│       ├── logo.png
│       ├── clock-icon-white.svg
│       └── products/            # 16 product images (.png)
├── server/
│   ├── index.mjs                # Express API server (port 3001)
│   ├── geocode.mjs              # Nominatim helpers
│   └── viacep.mjs               # ViaCEP helpers
├── src/
│   ├── api/                     # Client-side API callers
│   ├── cart/                    # Cart store + pub-sub
│   ├── checkout/                # Form state + validation
│   ├── data/                    # Products & stores static data
│   ├── location/                # Location state management
│   ├── styles/app.css           # Global stylesheet
│   ├── types/                   # TypeScript types
│   ├── ui/                      # All render functions
│   └── main.ts                  # App entry point — event handlers + render loop
├── tests/
│   ├── helpers.ts               # Shared Playwright actions
│   ├── 01-product-catalog.spec.ts
│   ├── 02-category-filter.spec.ts
│   ├── 03-location-panel.spec.ts
│   ├── 04-geocoding-store.spec.ts
│   ├── 05-cart.spec.ts
│   ├── 06-checkout-validation.spec.ts
│   ├── 07-order-confirmation.spec.ts
│   ├── 08-navigation.spec.ts
│   └── 09-ui-feedback.spec.ts
├── specs/
│   └── README.md                # Playwright Agents test-plan directory
├── .cursor/mcp.json             # Cursor MCP server config
├── playwright.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
npx playwright install chromium
```

### Run the app

```bash
npm run dev:all
```

This starts both servers concurrently:

| Server | URL | Purpose |
|---|---|---|
| Vite dev server | `http://localhost:5173` | Frontend SPA |
| Express API | `http://localhost:3001` | Delivery session + geocoding proxy |

---

## Application Features

### Product Catalog

- **16 products** across 5 categories
- Each card shows: name, description, USD price, product image
- Spicy products display a **Spicy** badge

| Category | Count | Example products |
|---|---|---|
| Burger | 4 | Cheeseburguer, BT Special (spicy), Avocado Burguer, Cheeseburguer Bacon |
| Tenders | 2 | Pack of Tenders, Spicy Pack of Tenders |
| Combos | 4 | Tenders + Cheeseburguer, Spicy Tenders + Milkshake, Tenders + Drink, Bacon + Fries |
| Drinks | 2 | Doctor BT, Guaraná |
| Sides | 4 | Plain Fries, Lemon Pepper Fries, Chocolate Milkshake, Strawberry Milkshake |

---

### Category Filter

A `<select>` dropdown above the product grid filters the catalog by category. Options: **All**, **Burgers**, **Tenders**, **Combos**, **Drinks**, **Sides**. Selecting a category with no products shows an empty-state message.

---

### Delivery Location Panel

A slide-in drawer (right → left animation) where the user sets their delivery address.

**Flow:**

1. Click the location pin icon in the header
2. Select country (Brazil or United States)
3. Enter ZIP / postal code
4. Click **Look up address**
   - Button turns into a spinning loader while the API call runs
   - The **Save location** button is disabled with its own spinner during lookup
   - 500 ms after lookup completes, Save re-enables
5. Address fields auto-fill (street, neighborhood, city, state, country)
6. The store list updates to show stores for the selected country
7. A status message shows delivery availability
8. Click **Save location** to persist — panel closes

**Store availability:**

| ZIP | City | Store |
|---|---|---|
| `86015280` | Londrina, PR, Brazil | Burguer-Tenders Higienopolis |
| `05413010` | São Paulo, SP, Brazil | Burguer-Tenders Pinheiros |
| `10001` | New York, NY, USA | Burguer-Tenders Midtown |
| Any other | — | No delivery available |

After saving, a **store banner** appears above the product grid: `Ordering from <store name>`.

**Panel behaviour rules:**
- Opening the location panel closes the cart drawer (and vice versa)
- Pressing `Escape` closes the panel
- Clicking the backdrop closes the panel
- Typing in any input does **not** re-render or collapse the panel
- Changing the country `<select>` patches only the stores block in-place — no full re-render

---

### Cart

- Products can only be added after a delivery location is saved
- If the user clicks **Add to cart** without a location, the location panel opens automatically
- A **green toast notification** appears for 2.5 seconds confirming the addition
- The cart badge in the header always shows the current item count (shows `0` when empty)
- The cart drawer supports quantity increment, decrement, and line removal
- All cart mutations update the DOM in-place (no full re-render / no panel collapse)

---

### Checkout

Reached via **Go to checkout** inside the cart drawer. A 0.75-second full-screen spinner overlay plays during navigation.

**Form sections:**

1. **Your details** — Name, Email
2. **Delivery address** — Read-only inputs pre-filled from the saved location (ZIP, Street, Neighborhood, City/State, Country, Complement) + store name
3. **Payment** — Credit/debit card or Pay in restaurant
   - Card fields: Name on card, Card number (formatted `XXXX XXXX XXXX XXXX`), Expiry (`MM / YY`), CVC (masked)
   - Real-time formatting: digits-only enforcement on number/expiry/CVC; letters-only on name

**Validation rules:**

| Field | Rule |
|---|---|
| Name | Required |
| Email | Must contain `@` and a domain with `.` after it |
| Card name | Letters, spaces, hyphens, apostrophes only — no digits |
| Card number | 13–19 digits |
| Expiry | Valid `MM/YY`, month 01–12, not in the past |
| CVC | 3 or 4 digits |

---

### Order Confirmation

After a successful order submission, the app navigates to a confirmation page showing:

- **Thank you, `<name>`!**
- Your order is placed!
- ETA **30 min** with a clock icon
- Full delivery address (read-only)
- Back to menu button

---

### UI / UX Details

| Feature | Detail |
|---|---|
| Favicon | Burger SVG icon in browser tab |
| Header logo | Clickable — returns to home from any view |
| Drawer animations | Both location and cart panels slide in from the right |
| Checkout spinner | Full-screen overlay with red ring spinner (0.75 s) |
| Spicy badge | Shown only on spicy products |
| Cart toast | Green bottom panel, auto-hides in 2.5 s |
| Empty category | Shows "No items in this category yet." message |
| Reduced motion | Animations suppressed via `prefers-reduced-motion` |

---

## Backend API

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/geocode?postalCode=&countryCode=` | Resolves a ZIP to a structured address |
| `GET` | `/api/delivery` | Returns the saved delivery for the current session |
| `POST` | `/api/delivery` | Saves delivery details for the current session |

Sessions are tracked via an `HttpOnly` cookie (`bt_sid`). The session store is in-memory — data resets on server restart.

**Geocoding providers:**
- Brazil → **ViaCEP** (primary, full CEP coverage)
- US / other → **Nominatim / OpenStreetMap** (no API key required)

---

## Automated Tests

### Setup

Tests require the app to be running. In one terminal:

```bash
npm run dev:all
```

Then in another terminal run the tests.

### Running Tests

| Command | Description |
|---|---|
| `npm test` | Headless run, all suites, list reporter |
| `npm run test:ui` | Playwright interactive UI mode |
| `npm run test:headed` | Visible Chromium window |
| `npm run test:report` | Open the last HTML report |

### Configuration (`playwright.config.ts`)

| Setting | Value |
|---|---|
| Base URL | `http://localhost:5173` |
| Browser | Chromium (Desktop Chrome) |
| Viewport | 1280 × 800 |
| Workers | 1 (sequential — avoids session collisions) |
| Retries | 0 locally, 2 on CI |
| Trace | On first retry |
| Screenshots | On failure only |
| Reports | `list` (terminal) + `html` → `playwright-report/` |

---

### Test Suites

| File | Suite | Tests | What it covers |
|---|---|---|---|
| `01-product-catalog.spec.ts` | Product Catalog | 5 | Product count, card content, spicy badges, price format |
| `02-category-filter.spec.ts` | Category Filter | 8 | Default filter, per-category counts, filter persistence |
| `03-location-panel.spec.ts` | Location Panel | 10 | Open/close, keyboard/backdrop dismiss, mutual exclusion with cart, focus stability |
| `04-geocoding-store.spec.ts` | Geocoding & Store | 6 | ZIP → store resolution, store banner, field auto-fill |
| `05-cart.spec.ts` | Cart | 10 | Badge count, toast, silent re-render, subtotal, location gate |
| `06-checkout-validation.spec.ts` | Checkout Validation | 10 | All form field validations, read-only delivery fields, store name |
| `07-order-confirmation.spec.ts` | Order Confirmation | 6 | Thank-you heading, ETA, clock icon, address display |
| `08-navigation.spec.ts` | Navigation | 5 | Logo, back link, spinner overlay, SPA routing |
| `09-ui-feedback.spec.ts` | UI Feedback | 7 | Slide animations, store banner, favicon, empty state, focus stability |

**Total: 67 test cases**

---

### Shared Helpers (`tests/helpers.ts`)

All spec files import reusable actions from `helpers.ts`:

| Function | Description |
|---|---|
| `saveLocation(page, zip, country)` | Opens panel → fills ZIP → clicks lookup → waits for spinner → waits for save button to re-enable → saves |
| `lookupAddress(page, zip, country)` | Same as above but stops before clicking Save (panel stays open) |
| `addToCart(page, productId)` | Clicks the Add to cart button for a given product |
| `goToCheckout(page)` | Clicks Go to checkout → waits for spinner overlay → waits for checkout page |
| `fillValidCard(page)` | Fills all card fields with valid test data |
| `fillPersonalDetails(page, name?, email?)` | Fills name and email on the checkout form |

---

### Reference Data

**Test ZIPs (`ZIPS` constant):**

| Key | ZIP | Country | Expected store |
|---|---|---|---|
| `londrina` | `86015280` | BR | Burguer-Tenders Higienopolis |
| `saoPaulo` | `05413010` | BR | Burguer-Tenders Pinheiros |
| `newYork` | `10001` | US | Burguer-Tenders Midtown |
| `curitiba` | `80010010` | BR | *(no store — outside service area)* |

**Test card (`CARD` constant):**

| Field | Value |
|---|---|
| Name | `Test User` |
| Number | `4111111111111111` |
| Expiry | `1228` (Dec 2028) |
| CVC | `123` |

---

### Playwright MCP (AI Agents)

The project ships two MCP server configs in `.cursor/mcp.json`:

| Server | Package | Purpose |
|---|---|---|
| `playwright` | `@playwright/mcp` | Browser automation — navigate, click, screenshot, assert live UI directly from Cursor Agent chat |
| `playwright-test` | `playwright run-test-mcp-server` | Run/heal/generate `.spec.ts` tests via AI agents |

Three agent definition files (generated by `npx playwright init-agents`) live in `.github/agents/`:

| File | Role |
|---|---|
| `playwright-test-generator.agent.md` | Generates new test specs from a plain-English description |
| `playwright-test-healer.agent.md` | Heals failing tests by inspecting errors and fixing selectors |
| `playwright-test-planner.agent.md` | Plans a full test suite from a feature description |

**To use in Cursor:** switch the chat panel to **Agent** mode — both MCP servers must show a green dot in Settings → MCP.
