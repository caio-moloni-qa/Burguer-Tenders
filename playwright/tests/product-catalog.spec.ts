import { test, expect } from "../helpers/fixtures";
import { SPICY_PRODUCT_IDS } from "../data/testData";

function isUsdPrice(value: string): boolean {
  const text = value.trim();
  if (!text.startsWith("$")) {
    return false;
  }
  const [dollars, cents] = text.slice(1).split(".");
  return Boolean(dollars) &&
    cents?.length === 2 &&
    [...dollars, ...cents].every((char) => char >= "0" && char <= "9");
}

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
      expect(isUsdPrice(await app.menu.productPrice(card).innerText())).toBe(true);
      expect(await app.menu.productImage(card).getAttribute("src")).toBeTruthy();
    }
  });

  test("Spicy badge appears only on spicy products", async ({ app }) => {
    for (const id of SPICY_PRODUCT_IDS) {
      await expect(app.menu.productBadge(id)).toBeVisible();
      const badge = (await app.menu.productBadge(id).innerText()).toLowerCase();
      expect(["spicy", "picante"]).toContain(badge);
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
      expect(isUsdPrice(await prices.nth(i).innerText())).toBe(true);
    }
  });
});

