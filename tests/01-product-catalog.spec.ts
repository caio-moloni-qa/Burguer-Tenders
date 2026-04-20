import { test, expect } from "@playwright/test";

const SPICY_IDS = ["bt-special", "pack-tenders-spicy", "combo-spicy-milkshake"];

test.describe("Suite 01 — Product Catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-01-01 — All 16 products are displayed on page load", async ({ page }) => {
    const cards = page.locator('[data-testid="product-grid"] [data-testid="product-image"]');
    await expect(cards).toHaveCount(16);
  });

  test("TC-01-02 — Each product card shows name, description, price and image", async ({ page }) => {
    const cards = page.locator('[data-testid="product-grid"] .product-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator(".product-card__name")).not.toBeEmpty();
      await expect(card.locator(".product-card__desc")).not.toBeEmpty();
      await expect(card.locator(".product-card__price")).toHaveText(/^\$\d+\.\d{2}$/);
      const img = card.locator('[data-testid="product-image"]');
      await expect(img).toHaveAttribute("src", /.+/);
    }
  });

  test("TC-01-03 — Spicy badge appears only on spicy products", async ({ page }) => {
    // Fresh session → en-US locale → badge reads "Spicy".
    // After a BR lookup the badge reads "Picante" (pt-BR).
    // We assert presence of the badge element; the text check uses a
    // locale-agnostic regex so the test stays green in both locales.
    for (const id of SPICY_IDS) {
      const badge = page.locator(`[data-product-id="${id}"] .product-card__badge`);
      await expect(badge).toBeVisible();
      await expect(badge).toHaveText(/spicy|picante/i);
    }
  });

  test("TC-01-04 — Non-spicy products have no badge", async ({ page }) => {
    const allCards = page.locator('[data-testid="product-grid"] .product-card');
    const count = await allCards.count();
    for (let i = 0; i < count; i++) {
      const card = allCards.nth(i);
      const productId = await card.getAttribute("data-product-id");
      if (productId && !SPICY_IDS.includes(productId)) {
        await expect(card.locator(".product-card__badge")).toHaveCount(0);
      }
    }
  });

  test("TC-01-05 — Prices are formatted in USD", async ({ page }) => {
    const prices = page.locator(".product-card__price");
    const count = await prices.count();
    for (let i = 0; i < count; i++) {
      await expect(prices.nth(i)).toHaveText(/^\$\d+\.\d{2}$/);
    }
  });
});
