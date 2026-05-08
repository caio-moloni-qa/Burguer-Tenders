import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";
const CUSTOMER = "Alice";
const EMAIL = "alice@example.com";

test.describe("Order Placement & Confirmation Page", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails(CUSTOMER, EMAIL);
    await app.checkout.fillValidCard();
  });

  test("Submitting valid form navigates to confirmation page", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();
  });

  test("Confirmation page shows customer name in greeting [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.title).toContainText(CUSTOMER);
  });

  test("Confirmation page shows ETA of 30 min [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.eta).toContainText("30 min");
  });

  test("Back to menu button returns to product grid [Locale-aware]", async ({ app }) => {
    await app.checkout.placeOrderNow();
    await expect(app.confirmation.pageRoot).toBeVisible();

    await app.confirmation.back();
    await expect(app.menu.productGrid).toBeVisible();
  });
});
