import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel, ConfirmationPage } from "../pages";
import { ZIPS, PRODUCTS, CUSTOMER } from "../data/test-data";

const PRODUCT_ID = PRODUCTS.cheeseburguer;

test.describe("Suite 07 — Order Placement & Confirmation Page", () => {
  let menu:         MenuPage;
  let confirmation: ConfirmationPage;

  test.beforeEach(async ({ page }) => {
    menu = new MenuPage(page);
    const location = new LocationPanel(page);

    await menu.goto();
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();
    await checkout.fillPersonalDetails(CUSTOMER.name, CUSTOMER.email);
    await checkout.fillCard();
    confirmation = new ConfirmationPage(page);
  });

  test("TC-07-01 — Submitting valid form navigates to confirmation page", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.confirmPage).toBeVisible();
  });

  test("TC-07-02 — Confirmation page shows customer name in greeting [Locale-aware]", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.title).toContainText(CUSTOMER.name);
  });

  test("TC-07-03 — Confirmation page shows order-placed subtitle [Locale-aware]", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.subtitle)
      .toContainText("pedido foi realizado");
  });

  test("TC-07-04 — Confirmation page shows ETA of 30 min [Locale-aware]", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.eta).toContainText("30 min");
  });

  test("TC-07-05 — Confirmation page shows clock icon in ETA row", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.etaIcon).toBeVisible();
  });

  test("TC-07-06 — Confirmation page shows full delivery address", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.address).toContainText(ZIPS.saoPaulo.zip);
    await expect(confirmation.address).not.toBeEmpty();
  });

  test("TC-07-07 — Cart is empty after order is placed [Locale-aware]", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.confirmPage).toBeVisible();

    await confirmation.goBack();
    await expect(menu.productGrid).toBeVisible();

    const cart = await menu.openCart();
    await expect(menu.cartCount).toHaveText("0");
    await expect(cart.emptyState).toBeVisible();
  });

  test("TC-07-08 — Back to menu button returns to product grid [Locale-aware]", async ({ page }) => {
    await page.locator('[data-testid="place-order"]').click();
    await expect(confirmation.confirmPage).toBeVisible();

    await confirmation.goBack();
    await expect(menu.productGrid).toBeVisible();
  });
});
