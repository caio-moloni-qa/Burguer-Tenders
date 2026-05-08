import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";

test.describe("Navigation & Views", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("Page loads at the home / menu view", async ({ app }) => {
    await expect(app.menu.productGrid).toBeVisible();
  });

  test("Logo click returns to home from confirmation page", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails();
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();

    await app.header.goHome();
    await expect(app.menu.productGrid).toBeVisible();
  });

  test("Back to menu link from checkout returns to home", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.goBackToShop();
    await expect(app.menu.productGrid).toBeVisible();
  });

  test("Header title navigates to home", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.header.goHome();
    await expect(app.menu.productGrid).toBeVisible();
  });
});
