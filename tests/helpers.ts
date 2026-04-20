import { Page } from "@playwright/test";

// ─── ZIPs & card data ────────────────────────────────────────────────────────

export const ZIPS = {
  londrina:  { zip: "86015280", country: "BR", store: "Burguer-Tenders Higienopolis" },
  saoPaulo:  { zip: "05413010", country: "BR", store: "Burguer-Tenders Pinheiros"   },
  newYork:   { zip: "10001",    country: "US", store: "Burguer-Tenders Midtown"      },
  curitiba:  { zip: "80010010", country: "BR", store: null                           },
} as const;

export const CARD = {
  name:   "Test User",
  number: "4111111111111111",
  expiry: "1228",
  cvc:    "123",
} as const;

// ─── Shared actions ───────────────────────────────────────────────────────────

/**
 * Open the location panel, pick a country, enter a ZIP, click "Look up address",
 * wait for the store status to resolve, then click "Save location".
 */
export async function saveLocation(
  page: Page,
  zip: string,
  country: "BR" | "US"
): Promise<void> {
  await page.click('[data-testid="location-toggle"]');
  await page.waitForSelector('[data-testid="location-panel"]');

  await page.selectOption('[data-testid="location-country"]', country);
  await page.fill('[data-testid="location-zip"]', zip);
  await page.click('[data-testid="location-lookup"]');

  // 1. Wait for lookup spinner to appear (lookup started)
  await page.waitForSelector(
    '[data-testid="location-lookup"] .location-lookup-btn__spinner',
    { state: 'attached', timeout: 5_000 }
  ).catch(() => { /* spinner may already be gone on fast responses */ });

  // 2. Wait for lookup spinner to disappear (lookup finished)
  await page.waitForSelector(
    '[data-testid="location-lookup"] .location-lookup-btn__spinner',
    { state: 'detached', timeout: 20_000 }
  );

  // 3. Wait for the save button to re-enable (it unlocks 500 ms after lookup ends)
  await page.waitForSelector(
    '[data-testid="location-save"]:not([disabled])',
    { timeout: 3_000 }
  );

  await page.click('[data-testid="location-save"]');
  // Panel should close after a successful save
  await page.waitForSelector('[data-testid="location-panel"]', { state: "attached" });
}

/**
 * Add a product to the cart by its data-product-id.
 * Assumes a delivery location is already saved.
 */
export async function addToCart(page: Page, productId: string): Promise<void> {
  await page.click(
    `[data-product-id="${productId}"] [data-testid="add-to-cart"]`
  );
}

/**
 * Navigate to checkout (clicks Go to checkout and waits for the spinner to clear).
 */
export async function goToCheckout(page: Page): Promise<void> {
  await page.click('[data-testid="go-checkout"]');
  await page.waitForSelector(".page-spinner-overlay", { state: "visible" });
  await page.waitForSelector(".page-spinner-overlay", {
    state: "hidden",
    timeout: 4_000,
  });
  await page.waitForSelector('[data-testid="checkout-page"]');
}

/**
 * Fill in valid card details on the checkout form.
 */
export async function fillValidCard(page: Page): Promise<void> {
  await page.fill('[data-testid="checkout-card-name"]', CARD.name);
  await page.fill('[data-testid="checkout-card-number"]', CARD.number);
  await page.fill('[data-testid="checkout-card-expiry"]', CARD.expiry);
  await page.fill('[data-testid="checkout-card-cvc"]',   CARD.cvc);
}

/**
 * Open the location panel, pick a country, enter a ZIP, click the lookup
 * button and wait for the request to finish — WITHOUT clicking "Save location".
 * Use this when you need to inspect state right after address resolution
 * (e.g. store-status text, locale switch) before committing the location.
 *
 * NOTE: the panel is left OPEN after this call.
 */
export async function lookupAddress(
  page: Page,
  zip: string,
  country: "BR" | "US"
): Promise<void> {
  await page.click('[data-testid="location-toggle"]');
  await page.waitForSelector('[data-testid="location-panel"]');

  await page.selectOption('[data-testid="location-country"]', country);
  await page.fill('[data-testid="location-zip"]', zip);
  await page.click('[data-testid="location-lookup"]');

  // Wait for spinner to appear (lookup started)
  await page.waitForSelector(
    '[data-testid="location-lookup"] .location-lookup-btn__spinner',
    { state: 'attached', timeout: 5_000 }
  ).catch(() => { /* spinner may already be gone on very fast responses */ });

  // Wait for spinner to disappear (lookup finished, re-render done)
  await page.waitForSelector(
    '[data-testid="location-lookup"] .location-lookup-btn__spinner',
    { state: 'detached', timeout: 20_000 }
  );
}

/**
 * Fill the required personal details (name + email) on the checkout form.
 */
export async function fillPersonalDetails(
  page: Page,
  name = "Alice",
  email = "alice@example.com"
): Promise<void> {
  await page.fill('[data-testid="checkout-name"]',  name);
  await page.fill('[data-testid="checkout-email"]', email);
}
