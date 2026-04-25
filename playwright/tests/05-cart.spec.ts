import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS, PRODUCTS } from "../data/test-data";

const PRODUCT_ID = PRODUCTS.cheeseburguer;

test.describe("Suite 05 — Cart", () => {
  let menu: MenuPage;
  let location: LocationPanel;

  test.beforeEach(async ({ page }) => {
    menu     = new MenuPage(page);
    location = new LocationPanel(page);
    await menu.goto();
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
  });

  test("TC-05-01 — Cart badge shows 0 and is visually hidden when cart is empty", async () => {
    await expect(menu.cartCount).toHaveText("0");
    await expect(menu.cartCount).not.toHaveClass(/header-cart__badge--visible/);
  });

  test("TC-05-02 — Cart drawer opens on cart icon click", async () => {
    const cart = await menu.openCart();
    await expect(cart.drawer).toBeVisible();
  });

  test("TC-05-03 — Adding a product increments the badge", async () => {
    await menu.addToCart(PRODUCT_ID);
    await expect(menu.cartCount).toHaveText("1");
  });

  test("TC-05-04 — Toast notification appears after adding", async () => {
    await menu.addToCart(PRODUCT_ID);
    await expect(menu.cartToast).toBeVisible();
    await expect(menu.cartToast).toContainText("Cheeseburguer");
  });

  test("TC-05-05 — Toast auto-hides within 3 seconds", async ({ page }) => {
    await menu.addToCart(PRODUCT_ID);
    await expect(menu.cartToast).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(menu.cartToast).toBeHidden();
  });

  test("TC-05-06 — Cart drawer does not re-render when incrementing quantity", async () => {
    await menu.addToCart(PRODUCT_ID);
    const cart = await menu.openCart();
    await expect(cart.drawer).toBeVisible();

    await cart.increment();
    await expect(cart.drawer).toBeVisible();
    await expect(menu.cartCount).toHaveText("2");
  });

  test("TC-05-07 — Increment and decrement update quantity correctly", async () => {
    await menu.addToCart(PRODUCT_ID);
    const cart = await menu.openCart();

    await cart.increment();
    await expect(cart.lineQty).toHaveText("2");

    await cart.decrement();
    await expect(cart.lineQty).toHaveText("1");
  });

  test("TC-05-08 — Removing last item empties cart and hides badge", async () => {
    await menu.addToCart(PRODUCT_ID);
    const cart = await menu.openCart();

    await cart.removeItem();
    await expect(menu.cartCount).toHaveText("0");
    await expect(cart.emptyState).toBeVisible();
  });

  test("TC-05-09 — Cart subtotal matches sum of line totals", async () => {
    await menu.addToCart(PRODUCT_ID);
    const cart = await menu.openCart();

    const lineTotal = await cart.lineTotal.first().textContent();
    const subtotal  = await cart.subtotal.textContent();
    expect(lineTotal?.trim()).toBe(subtotal?.trim());
  });

  test("TC-05-10 — Cart requires a saved location to add products", async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    await menu.addToCart(PRODUCT_ID);
    await expect(location.panel).toBeVisible();
  });
});
