import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

test.describe("Suite 02 - Category Filter", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("TC-02-01 - Default filter is All and shows 16 products", async ({ app }) => {
    await expect(app.menu.filterButton("all")).toHaveAttribute("aria-pressed", "true");
    await expect(app.menu.productCards).toHaveCount(16);
  });

  test("TC-02-02 - Filtering by Burgers shows 4 products", async ({ app }) => {
    await app.menu.filterBy("burger");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("TC-02-03 - Filtering by Tenders shows 2 products", async ({ app }) => {
    await app.menu.filterBy("tenders");
    await expect(app.menu.productCards).toHaveCount(2);
  });

  test("TC-02-04 - Filtering by Combos shows 4 products", async ({ app }) => {
    await app.menu.filterBy("combo");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("TC-02-05 - Filtering by Drinks shows 2 products", async ({ app }) => {
    await app.menu.filterBy("drink");
    await expect(app.menu.productCards).toHaveCount(2);
  });

  test("TC-02-06 - Filtering by Sides shows 4 products", async ({ app }) => {
    await app.menu.filterBy("side");
    await expect(app.menu.productCards).toHaveCount(4);
  });

  test("TC-02-07 - Switching back to All restores 16 products", async ({ app }) => {
    await app.menu.filterBy("burger");
    await app.menu.filterBy("all");
    await expect(app.menu.productCards).toHaveCount(16);
  });

  test("TC-02-08 - Filter persists after cart drawer open/close", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.menu.filterBy("drink");
    await expect(app.menu.productCards).toHaveCount(2);

    await app.header.openCart();
    await app.cart.close();

    await expect(app.menu.filterButton("drink")).toHaveAttribute("aria-pressed", "true");
    await expect(app.menu.productCards).toHaveCount(2);
  });
});

