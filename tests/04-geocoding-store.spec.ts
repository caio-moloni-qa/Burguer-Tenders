import { test, expect } from "@playwright/test";
import { ZIPS, saveLocation, lookupAddress } from "./helpers";

test.describe("Suite 04 — Address Geocoding & Store Resolution", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── TC-04-01 / TC-04-02 / TC-04-03 — ZIP resolution per supported area ─────

  test("TC-04-01 — Londrina BR ZIP resolves to Burguer-Tenders Higienopolis", async ({ page }) => {
    // After a BR lookup that resolves a store the locale switches to pt-BR and the
    // full UI is re-rendered.  The store-status sentence becomes:
    //   "Entrega disponível por Burguer-Tenders Higienopolis"
    // We assert only on the store name so the test is locale-agnostic.
    await lookupAddress(page, ZIPS.londrina.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]'))
      .toContainText(ZIPS.londrina.store);
  });

  test("TC-04-02 — São Paulo BR ZIP resolves to Burguer-Tenders Pinheiros", async ({ page }) => {
    await lookupAddress(page, ZIPS.saoPaulo.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]'))
      .toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-04-03 — New York US ZIP resolves to Burguer-Tenders Midtown", async ({ page }) => {
    // US lookup → locale stays en-US → status: "Delivery available from Burguer-Tenders Midtown"
    await lookupAddress(page, ZIPS.newYork.zip, "US");
    await expect(page.locator('[data-testid="location-store-status"]'))
      .toContainText(ZIPS.newYork.store);
  });

  // ── TC-04-04 — Unknown / undeliverable city ───────────────────────────────

  test("TC-04-04 — Unknown city ZIP shows no-delivery message", async ({ page }) => {
    // Curitiba is a valid BR city but has no store — locale does NOT switch.
    await lookupAddress(page, ZIPS.curitiba.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]'))
      .toContainText(/don't deliver to this city yet|não entregamos nesta cidade/i);
  });

  // ── TC-04-05 — Address fields populated after lookup ──────────────────────

  test("TC-04-05 — Address fields are populated after a successful lookup", async ({ page }) => {
    await lookupAddress(page, ZIPS.saoPaulo.zip, "BR");
    await expect(page.locator('[data-testid="location-street"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="location-city"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="location-state"]')).not.toBeEmpty();
  });

  // ── TC-04-06 — Lookup button disabled while request is in flight ──────────

  test("TC-04-06 — Lookup button is disabled while request is in flight", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await page.waitForSelector('[data-testid="location-panel"]');
    await page.selectOption('[data-testid="location-country"]', "BR");
    await page.fill('[data-testid="location-zip"]', ZIPS.saoPaulo.zip);

    // Click lookup — patchLookupDOM runs synchronously before the async fetch,
    // so the button is disabled immediately on the next tick.
    await page.click('[data-testid="location-lookup"]');
    await expect(page.locator('[data-testid="location-lookup"]')).toBeDisabled();
    await expect(
      page.locator('[data-testid="location-lookup"] .location-lookup-btn__spinner')
    ).toBeVisible();
  });

  // ── TC-04-07 — Lookup does not wipe user-typed fields ────────────────────

  test("TC-04-07 — Complement field value is preserved after lookup", async ({ page }) => {
    // Open panel and type in complement BEFORE the lookup.
    // After the lookup resolves (which triggers a full re-render for BR stores),
    // locationDelivery.complement still holds the typed value so the re-render
    // correctly restores it.
    await page.click('[data-testid="location-toggle"]');
    await page.waitForSelector('[data-testid="location-panel"]');

    await page.fill('[data-testid="location-complement"]', "Apt 42");
    await page.selectOption('[data-testid="location-country"]', "BR");
    await page.fill('[data-testid="location-zip"]', ZIPS.saoPaulo.zip);
    await page.click('[data-testid="location-lookup"]');

    // Wait for the lookup to finish (spinner gone)
    await page.waitForSelector(
      '[data-testid="location-lookup"] .location-lookup-btn__spinner',
      { state: 'attached', timeout: 5_000 }
    ).catch(() => {});
    await page.waitForSelector(
      '[data-testid="location-lookup"] .location-lookup-btn__spinner',
      { state: 'detached', timeout: 20_000 }
    );

    await expect(page.locator('[data-testid="location-complement"]')).toHaveValue("Apt 42");
  });

  // ── TC-04-08 — Saved location persists across page reload ────────────────

  test("TC-04-08 — Saving a valid location persists across page reload", async ({ page }) => {
    await saveLocation(page, ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(page.locator('[data-testid="location-summary"]')).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="product-grid"]');
    await expect(page.locator('[data-testid="location-summary"]')).toBeVisible();
  });
});
