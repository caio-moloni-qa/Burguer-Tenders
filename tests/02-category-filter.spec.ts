import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS } from "./helpers";

test.describe("Suite 02 — Category Filter", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-02-01 — Default filter is All and shows 16 products", async ({ page }) => {
    const select = page.locator('[data-testid="menu-category-filter"]');
    await expect(select).toHaveValue("all");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(16);
  });

  test("TC-02-02 — Filtering by Burgers shows 4 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "burger");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(4);
  });

  test("TC-02-03 — Filtering by Tenders shows 2 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "tenders");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(2);
  });

  test("TC-02-04 — Filtering by Combos shows 4 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "combo");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(4);
  });

  test("TC-02-05 — Filtering by Drinks shows 2 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "drink");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(2);
  });

  test("TC-02-06 — Filtering by Sides shows 4 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "side");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(4);
  });

  test("TC-02-07 — Switching back to All restores 16 products", async ({ page }) => {
    await page.selectOption('[data-testid="menu-category-filter"]', "burger");
    await page.selectOption('[data-testid="menu-category-filter"]', "all");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(16);
  });

  test("TC-02-08 — Filter persists after cart drawer open/close", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.selectOption('[data-testid="menu-category-filter"]', "drink");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(2);

    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-action="close-cart"]');

    await expect(page.locator('[data-testid="menu-category-filter"]')).toHaveValue("drink");
    await expect(page.locator('[data-testid="product-grid"] .product-card')).toHaveCount(2);
  });
});
