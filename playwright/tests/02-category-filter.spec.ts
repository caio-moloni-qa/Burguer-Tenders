import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS } from "../data/test-data";

test.describe("Suite 02 — Category Filter", () => {
  let menu: MenuPage;

  test.beforeEach(async ({ page }) => {
    menu = new MenuPage(page);
    await menu.goto();
  });

  test("TC-02-01 — Default filter is All and shows 16 products", async () => {
    await expect(menu.categoryFilter).toHaveValue("all");
    await expect(menu.productCards).toHaveCount(16);
  });

  test("TC-02-02 — Filtering by Burgers shows 4 products", async () => {
    await menu.filterByCategory("burger");
    await expect(menu.productCards).toHaveCount(4);
  });

  test("TC-02-03 — Filtering by Tenders shows 2 products", async () => {
    await menu.filterByCategory("tenders");
    await expect(menu.productCards).toHaveCount(2);
  });

  test("TC-02-04 — Filtering by Combos shows 4 products", async () => {
    await menu.filterByCategory("combo");
    await expect(menu.productCards).toHaveCount(4);
  });

  test("TC-02-05 — Filtering by Drinks shows 2 products", async () => {
    await menu.filterByCategory("drink");
    await expect(menu.productCards).toHaveCount(2);
  });

  test("TC-02-06 — Filtering by Sides shows 4 products", async () => {
    await menu.filterByCategory("side");
    await expect(menu.productCards).toHaveCount(4);
  });

  test("TC-02-07 — Switching back to All restores 16 products", async () => {
    await menu.filterByCategory("burger");
    await menu.filterByCategory("all");
    await expect(menu.productCards).toHaveCount(16);
  });

  test("TC-02-08 — Filter persists after cart drawer open/close", async ({ page }) => {
    const location = new LocationPanel(page);
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);

    await menu.filterByCategory("drink");
    await expect(menu.productCards).toHaveCount(2);

    const cart = await menu.openCart();
    await cart.close();

    await expect(menu.categoryFilter).toHaveValue("drink");
    await expect(menu.productCards).toHaveCount(2);
  });
});
