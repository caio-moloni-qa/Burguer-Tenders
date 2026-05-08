# BeeTee's

Training e-commerce SPA for Playwright automation. The app simulates a fast-food ordering flow with localized content, delivery lookup, cart, checkout, and order confirmation.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 6, TypeScript, MUI |
| State | Zustand |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL 16 |
| DB client | `pg` |
| Tests | Playwright + Page Object Model |
| Geocoding | ViaCEP for BR, Nominatim for US/other |

Vite is still required: dev server, JSX/TS bundling, production build, and `/api` proxy.

## Quick Start

```bash
npm install
npx playwright install chromium
docker compose up -d db
npm run db:setup
npm run dev:all
```

| Service | URL |
|---|---|
| App | `http://localhost:5173` |
| API | `http://localhost:3001` |
| PostgreSQL | `localhost:5432` |

## Environment

Default local DB:

```txt
DATABASE_URL=postgres://beetee:beetee_dev_password@localhost:5432/beetee_dev
```

Optional env vars:

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Express API port |
| `DATABASE_URL` | local Docker DB | PostgreSQL connection |
| `NOMINATIM_USER_AGENT` | training UA | OpenStreetMap request identity |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite frontend only |
| `npm run server` | Express API only |
| `npm run dev:all` | Frontend + API |
| `npm run db:migrate` | Apply `database/schema.sql` |
| `npm run db:seed` | Seed translations, products, promos |
| `npm run db:setup` | Migrate + seed |
| `npm run build` | TypeScript + Vite production build |
| `npm test` | Playwright headless run |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:headed` | Headed Chromium |
| `npm run test:report` | Open HTML report |

## Database

Share DB structure through source-controlled files:

```txt
docker-compose.yml
database/schema.sql
database/migrate.mjs
database/seed.mjs
package.json
```

New machine setup:

```bash
npm install
docker compose up -d db
npm run db:setup
npm run dev:all
```

Tables:

| Table | Purpose |
|---|---|
| `translations` | UI copy by locale/key |
| `products` | Product metadata: category, image, price, calories, spicy flag |
| `product_translations` | Product name, short name, description by locale |
| `promos` | Promo carousel image metadata |

Current seed source:

- `src/i18n/locale.ts` fallback dictionaries
- `src/data/products.ts` fallback product catalog
- promo metadata in `database/seed.mjs`

These frontend values are fallback + seed material. Runtime content loads from PostgreSQL through `/api/content`.

## Content Flow

```txt
React startup
  -> useContentBootstrap()
  -> GET /api/content
  -> Express contentRepository
  -> PostgreSQL
  -> setProducts() + setTranslationDictionaries()
  -> localeVersion re-render
```

Locale behavior:

- Default: `en-US`
- BR delivery/store lookup: switches to `pt-BR`
- US delivery/store lookup: switches to `en-US`
- Prices display USD or BRL via active locale

## API

Base URL: `http://localhost:3001`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API liveness |
| `GET` | `/api/content` | DB-backed products, translations, promos |
| `GET` | `/api/geocode?postalCode=&countryCode=` | Postal-code lookup |
| `GET` | `/api/delivery` | Read delivery session |
| `POST` | `/api/delivery` | Save delivery session |

Sessions use `bt_sid` HttpOnly cookie + in-memory server `Map`.

## App Capabilities

- 16-product catalog across burgers, tenders, combos, drinks, sides
- Localized product names/descriptions and UI copy
- Promo carousel
- Menu category filter and search
- Product spicy badges and calories meter
- Delivery drawer with store availability
- Cart drawer with quantity controls and toast feedback
- Item customizer with add-ons
- Checkout with card validation, tip, and donation controls
- Confirmation page with ETA and delivery summary

## Architecture

```txt
src/App.tsx
|-- MenuPage
|   |-- PromoBanner
|   |-- CategoryFilter
|   |-- MenuSearch
|   `-- ProductCard
|-- CartDrawer
|-- LocationDrawer
|-- ItemCustomizerDialog
|-- CheckoutPage
`-- ConfirmationPage
```

State stores:

| Store | Role |
|---|---|
| `uiStore` | view, filter, search, toast, spinner, localeVersion |
| `cartStore` | cart lines, quantities, drawer state |
| `locationStore` | delivery fields, lookup state, panel state |
| `checkoutStore` | form fields, errors, confirmation user |

## Testing

Tests live in `playwright/tests/`. Page Objects live in `playwright/pages/`.

Run app first:

```bash
npm run dev:all
```

Run tests:

```bash
npm test
```

Specs:

| File | Covers |
|---|---|
| `product-catalog.spec.ts` | Product cards, images, prices, spicy badges |
| `category-filter.spec.ts` | Category filters and product counts |
| `location-panel.spec.ts` | Drawer behavior and field persistence |
| `geocoding-store.spec.ts` | ZIP lookup and store resolution |
| `cart.spec.ts` | Add-to-cart, quantities, subtotal, location gate |
| `checkout-validation.spec.ts` | Form validation and checkout rules |
| `order-confirmation.spec.ts` | Confirmation page content |
| `navigation.spec.ts` | Routing and navigation |
| `dynamic-translation.spec.ts` | EN/PT locale behavior |

Playwright config:

| Setting | Value |
|---|---|
| Base URL | `http://localhost:5173` |
| Browser | Chromium |
| Viewport | `1280x800` |
| Workers | `1` |
| Retries | `0` local, `2` CI |
| Trace | first retry |
| Screenshot | failure only |

## Test Data

| Key | ZIP | Country | Expected store |
|---|---|---|---|
| `londrina` | `86015280` | BR | `BeeTee's Higienopolis` |
| `saoPaulo` | `05413010` | BR | `BeeTee's Pinheiros` |
| `newYork` | `10001` | US | `BeeTee's Midtown` |
| `curitiba` | `80010010` | BR | no store |

Test card:

```txt
Name: Test User
Number: 4111111111111111
Expiry: 1228
CVC: 123
```

## MCP

`.cursor/mcp.json` configures:

| Server | Purpose |
|---|---|
| `playwright` | Browser automation from agent chat |
| `playwright-test` | Run, debug, generate, heal specs |

Use Cursor Agent mode and mention `@playwright` or `@playwright-test`.

## Troubleshooting

### `docker` not found

Install Docker Desktop, or run PostgreSQL manually and set `DATABASE_URL`.

### `/api/content` returns 503

DB is down, schema missing, or seed missing.

```bash
docker compose up -d db
npm run db:setup
```

### App stays on loading overlay

Check API and content endpoint:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/content
```

### Tests fail at startup

Ensure both app and DB are running:

```bash
docker compose up -d db
npm run db:setup
npm run dev:all
```
