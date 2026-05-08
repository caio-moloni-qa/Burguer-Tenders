import { test, expect } from "../helpers/fixtures";
import { SPICY_PRODUCT_IDS } from "../data/testData";

test.describe("Product Catalog", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("All 16 products are displayed on page load", async ({ app }) => {
    await expect(app.menu.productImages).toHaveCount(16);
  });

  test("Each product card shows name, description, price and image", async ({ app }) => {
    const count = await app.menu.productCards.count();

    for (let i = 0; i < count; i++) {
      const card = app.menu.productCards.nth(i);
      await expect(app.menu.productName(card)).not.toBeEmpty();
      await expect(app.menu.productDescription(card)).not.toBeEmpty();
      await expect(app.menu.productPrice(card)).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(app.menu.productImage(card)).toHaveAttribute("src", /.+/);
    }
  });

  test("Spicy badge appears only on spicy products", async ({ app }) => {
    for (const id of SPICY_PRODUCT_IDS) {
      await expect(app.menu.productBadge(id)).toBeVisible();
      await expect(app.menu.productBadge(id)).toHaveText(/spicy|picante/i);
    }
  });

  test("Non-spicy products have no badge", async ({ app }) => {
    const count = await app.menu.productCards.count();

    for (let i = 0; i < count; i++) {
      const card = app.menu.productCards.nth(i);
      const productId = await card.getAttribute("data-product-id");

      if (productId && !SPICY_PRODUCT_IDS.includes(productId as typeof SPICY_PRODUCT_IDS[number])) {
        await expect(app.menu.productBadge(productId)).toHaveCount(0);
      }
    }
  });

  test("Prices are formatted in USD", async ({ app }) => {
    const prices = app.menu.productPrices();
    const count = await prices.count();

    for (let i = 0; i < count; i++) {
      await expect(prices.nth(i)).toHaveText(/^\$\d+\.\d{2}$/);
    }
  });
});

