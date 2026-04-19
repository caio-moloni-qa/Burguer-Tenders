import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS } from "./helpers";

const PRODUCT_ID = "cheeseburguer";

test.describe("Suite 09 — UI Feedback & Panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
  });

  test("TC-09-01 — Location panel slides in with animation", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    const panel = page.locator('[data-testid="location-panel"]');
    // The panel should exist in the DOM and not be at 100% translateX offset
    await expect(panel).toBeVisible();
    const transform = await panel.evaluate((el) =>
      getComputedStyle(el).transform
    );
    // After animation settles, transform should be identity (none / matrix(1,0,0,1,0,0))
    expect(transform).not.toMatch(/matrix\(1, 0, 0, 1, \d+\d+,/); // not still offset
  });

  test("TC-09-02 — Cart panel slides in with animation", async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await expect(drawer).toBeVisible();
    const transform = await drawer.evaluate((el) =>
      getComputedStyle(el).transform
    );
    expect(transform).not.toMatch(/matrix\(1, 0, 0, 1, \d+\d+,/);
  });

  test("TC-09-03 — Store banner is visible after save", async ({ page }) => {
    await expect(page.locator('[data-testid="menu-store-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-store-banner"]')).toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-09-04 — Favicon SVG is referenced in <head>", async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /favicon\.svg/);
  });

  test("TC-09-05 — Empty category shows empty-state message", async ({ page }) => {
    // Assuming "tenders" has items, navigate to a truly empty filter by using an artificial value
    // If all categories have items, this test validates that switching back from empty behaves correctly.
    // Instead, test the empty-state element exists when expected.
    await page.selectOption('[data-testid="menu-category-filter"]', "burger");
    // Grid should have cards, not an empty state
    await expect(page.locator('[data-testid="menu-empty-state"]')).toHaveCount(0);

    // Switch to a category filter value that doesn't map to any product
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="menu-category-filter"]') as HTMLSelectElement;
      if (select) { select.value = "nonexistent"; select.dispatchEvent(new Event("change")); }
    });
    // Empty state should now be present
    await expect(page.locator('[data-testid="menu-empty-state"]')).toBeVisible();
  });

  test("TC-09-06 — Typing in complement field does not re-render the panel", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    const complement = page.locator('[data-testid="location-complement"]');
    await complement.click();
    await page.keyboard.type("Apt 42");
    // Input must still be focused and contain the value
    await expect(complement).toBeFocused();
    await expect(complement).toHaveValue("Apt 42");
  });

  test("TC-09-07 — Page title contains the brand name", async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain("burguer");
  });
});
