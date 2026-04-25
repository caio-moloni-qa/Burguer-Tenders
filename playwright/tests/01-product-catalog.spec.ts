import { test, expect } from "@playwright/test";
import { MenuPage } from "../pages";
import { SPICY_PRODUCT_IDS } from "../data/test-data";

test.describe("Suite 01 — Product Catalog", () => {
  let menu: MenuPage;

  test.beforeEach(async ({ page }) => {
    menu = new MenuPage(page);
    await menu.goto();
  });

  test("TC-01-01 — All 16 products are displayed on page load", async ({ page }) => {
    const images = page.locator('[data-testid="product-grid"] [data-testid="product-image"]');
    await expect(images).toHaveCount(16);
  });

  test("TC-01-02 — Each product card shows name, description, price and image", async () => {
    const count = await menu.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = menu.productCards.nth(i);
      await expect(card.locator(".product-card__name")).not.toBeEmpty();
      await expect(card.locator(".product-card__desc")).not.toBeEmpty();
      await expect(card.locator(".product-card__price")).toContainText("$");
      await expect(card.locator(".product-card__price")).not.toContainText("R$");
      await expect(card.locator('[data-testid="product-image"]')).toBeVisible();
    }
  });

  test("TC-01-03 — Spicy badge appears only on spicy products", async () => {
    for (const id of SPICY_PRODUCT_IDS) {
      const badge = menu.spicyBadge(id);
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText("Spicy");
    }
  });

  test("TC-01-04 — Non-spicy products have no badge", async () => {
    const count = await menu.productCards.count();
    for (let i = 0; i < count; i++) {
      const card = menu.productCards.nth(i);
      const productId = await card.getAttribute("data-product-id");
      if (productId && !(SPICY_PRODUCT_IDS as readonly string[]).includes(productId)) {
        await expect(card.locator(".product-card__badge")).toHaveCount(0);
      }
    }
  });

  test("TC-01-05 — Prices are formatted in USD", async () => {
    const count = await menu.prices.count();
    for (let i = 0; i < count; i++) {
      await expect(menu.prices.nth(i)).toContainText("$");
      await expect(menu.prices.nth(i)).not.toContainText("R$");
    }
  });
});
