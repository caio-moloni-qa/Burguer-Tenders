import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS, PRODUCTS, CUSTOMER } from "../data/test-data";

const PRODUCT_ID = PRODUCTS.cheeseburguer;

test.describe("Suite 08 — Navigation & Views", () => {
  let menu: MenuPage;

  test.beforeEach(async ({ page }) => {
    menu = new MenuPage(page);
    await menu.goto();
  });

  test("TC-08-01 — Page loads at the home / menu view", async () => {
    await expect(menu.productGrid).toBeVisible();
  });

  test("TC-08-02 — Logo click returns to home from confirmation page", async ({ page }) => {
    const location = new LocationPanel(page);
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();
    await checkout.fillPersonalDetails(CUSTOMER.name, CUSTOMER.email);
    await checkout.fillCard();
    const confirmation = await checkout.placeOrder();
    await expect(confirmation.confirmPage).toBeVisible();

    await menu.clickLogo();
    await expect(menu.productGrid).toBeVisible();
  });

  test("TC-08-03 — Back to menu link from checkout returns to home", async ({ page }) => {
    const location = new LocationPanel(page);
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();
    await checkout.goBack();
    await expect(menu.productGrid).toBeVisible();
  });

  test("TC-08-04 — Checkout spinner overlay is shown briefly", async ({ page }) => {
    const location = new LocationPanel(page);
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    await menu.openCart();

    await page.locator('[data-testid="go-checkout"]').click();
    await expect(page.locator(".page-spinner-overlay")).toBeVisible({ timeout: 1000 });
    await page.waitForSelector(".page-spinner-overlay", { state: "hidden", timeout: 3000 });
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible();
  });

  test("TC-08-05 — Header title navigates to home", async ({ page }) => {
    const location = new LocationPanel(page);
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    const cart     = await menu.openCart();
    await cart.goToCheckout();
    await menu.clickLogo();
    await expect(menu.productGrid).toBeVisible();
  });
});
