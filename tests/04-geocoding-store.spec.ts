import { test, expect } from "@playwright/test";
import { ZIPS, saveLocation } from "./helpers";

test.describe("Suite 04 — Address Geocoding & Store Resolution", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  async function lookupOnly(page: import("@playwright/test").Page, zip: string, country: "BR" | "US") {
    await page.click('[data-testid="location-toggle"]');
    await page.selectOption('[data-testid="location-country"]', country);
    await page.fill('[data-testid="location-zip"]', zip);
    await page.click('[data-testid="location-lookup"]');

    // Wait for lookup spinner to appear then disappear
    await page.waitForSelector(
      '[data-testid="location-lookup"] .location-lookup-btn__spinner',
      { state: 'attached', timeout: 5_000 }
    ).catch(() => {});
    await page.waitForSelector(
      '[data-testid="location-lookup"] .location-lookup-btn__spinner',
      { state: 'detached', timeout: 20_000 }
    );

    // Wait for save button to re-enable (unlocks 500 ms after lookup ends)
    await page.waitForSelector(
      '[data-testid="location-save"]:not([disabled])',
      { timeout: 3_000 }
    );
  }

  test("TC-04-01 — BR ZIP 86015280 resolves to Londrina store", async ({ page }) => {
    await lookupOnly(page, ZIPS.londrina.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]')).toContainText(ZIPS.londrina.store);
  });

  test("TC-04-02 — BR ZIP 05413010 resolves to São Paulo store", async ({ page }) => {
    await lookupOnly(page, ZIPS.saoPaulo.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]')).toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-04-03 — Unknown ZIP shows no delivery available", async ({ page }) => {
    await lookupOnly(page, ZIPS.curitiba.zip, "BR");
    await expect(page.locator('[data-testid="location-store-status"]')).toContainText(/no delivery|not available/i);
  });

  test("TC-04-04 — Store banner appears on menu after save (Londrina)", async ({ page }) => {
    await saveLocation(page, ZIPS.londrina.zip, "BR");
    await expect(page.locator('[data-testid="menu-store-banner"]')).toContainText(ZIPS.londrina.store);
  });

  test("TC-04-05 — Store banner appears on menu after save (São Paulo)", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, "BR");
    await expect(page.locator('[data-testid="menu-store-banner"]')).toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-04-06 — Street/Neighborhood/City fields are auto-filled after lookup", async ({ page }) => {
    await lookupOnly(page, ZIPS.saoPaulo.zip, "BR");
    await expect(page.locator('[data-testid="location-street"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="location-neighborhood"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="location-city"]')).not.toBeEmpty();
  });
});
