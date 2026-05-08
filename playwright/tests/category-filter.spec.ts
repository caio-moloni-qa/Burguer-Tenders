import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

test.describe("Category Filter", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("Default filter is All and shows 16 products", async ({ app }) => {
    await expect(app.menu.filterButton("all")).toHaveAttribute("aria-pressed", "true");
    await expect(app.menu.productCards).toHaveCount(16);
  });

  test("Filtering by Burgers shows 4 products", async ({ app }) => {
    await app.menu.filterBy("burger");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("Filtering by Tenders shows 2 products", async ({ app }) => {
    await app.menu.filterBy("tenders");
    await expect(app.menu.productCards).toHaveCount(2);
  });

  test("Filtering by Combos shows 4 products", async ({ app }) => {
    await app.menu.filterBy("combo");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("Filtering by Drinks shows 2 products", async ({ app }) => {
    await app.menu.filterBy("drink");
    await expect(app.menu.productCards).toHaveCount(2);
  });

  test("Filtering by Sides shows 4 products", async ({ app }) => {
    await app.menu.filterBy("side");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("Switching back to All restores 16 products", async ({ app }) => {
    await app.menu.filterBy("burger");
    await app.menu.filterBy("all");
    await expect(app.menu.productCards).toHaveCount(16);
  });

  test("Filter persists after cart drawer open/close", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.menu.filterBy("drink");
    await expect(app.menu.productCards).toHaveCount(2);

    await app.header.openCart();
    await app.cart.close();

    await expect(app.menu.filterButton("drink")).toHaveAttribute("aria-pressed", "true");
    await expect(app.menu.productCards).toHaveCount(2);
  });
});

