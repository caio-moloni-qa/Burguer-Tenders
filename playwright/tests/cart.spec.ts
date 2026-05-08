import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";

test.describe("Cart", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
  });

  test("Cart badge shows 0 and is hidden from assistive tech when cart is empty", async ({ app }) => {
    await expect(app.header.cartCount).toHaveText("0");
    await expect(app.header.cartCount).toHaveAttribute("aria-hidden", "true");
  });

  test("Cart drawer opens on cart icon click", async ({ app }) => {
    await app.header.openCart();
    await expect(app.cart.drawer).toBeVisible();
  });

  test("Adding a product increments the badge", async ({ app }) => {
    await app.addToCart(PRODUCT_ID);
    await expect(app.header.cartCount).toHaveText("1");
  });

  test("Toast notification appears after adding", async ({ app }) => {
    await app.addToCart(PRODUCT_ID);
    await expect(app.toast).toBeVisible();
    await expect(app.toast).toContainText("Cheeseburguer");
  });

  test("Cart drawer stays open when incrementing quantity", async ({ app }) => {
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await expect(app.cart.drawer).toBeVisible();

    await app.cart.incrementFirstLine();
    await expect(app.cart.drawer).toBeVisible();
    await expect(app.header.cartCount).toHaveText("2");
  });

  test("Increment and decrement update quantity correctly", async ({ app }) => {
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.cart.incrementFirstLine();
    await expect(app.cart.lineQuantity()).toHaveText("2");

    await app.cart.decrementFirstLine();
    await expect(app.cart.lineQuantity()).toHaveText("1");
  });

  test("Cart subtotal matches sum of line totals", async ({ app }) => {
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();

    const lineTotal = await app.cart.lineTotal().textContent();
    const subtotal = await app.cart.subtotal.textContent();
    expect(lineTotal?.trim()).toBe(subtotal?.trim());
  });

  test("Cart requires a saved location to add products", async ({ app }) => {
    await app.clearSessionAndReloadToMenu();
    await app.menu.addProduct(PRODUCT_ID);
    await expect(app.location.panel).toBeVisible();
  });
});
