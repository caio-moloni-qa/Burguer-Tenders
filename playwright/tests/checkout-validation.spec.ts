import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const PRODUCT_ID = "cheeseburguer";

test.describe("Checkout Form Validation", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(PRODUCT_ID);
    await app.header.openCart();
    await app.goToCheckout();
  });

  test("Missing name shows error", async ({ app }) => {
    await app.checkout.email.fill("a@b.com");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("fullName")).toBeVisible();
  });

  test("Missing email shows error", async ({ app }) => {
    await app.checkout.name.fill("Alice");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  test("Email with no @ shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "nodomain");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  test("Email with @ but no domain dot shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@nodot");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("email")).toBeVisible();
  });

  test("Card number with fewer than 13 digits shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "411111",
      expiry: "1228",
      cvc: "123",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardNumber")).toBeVisible();
  });

  test("Past expiry date shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "4111111111111111",
      expiry: "0120",
      cvc: "123",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardExpiry")).toBeVisible();
  });

  test("Non-numeric CVC shows error", async ({ app }) => {
    await app.checkout.fillPersonalDetails("Alice", "alice@ex.com");
    await app.checkout.fillCard({
      name: "Alice",
      number: "4111111111111111",
      expiry: "1228",
      cvc: "ab",
    });
    await app.checkout.placeOrderNow();
    await expect(app.checkout.error("cardCvc")).toBeVisible();
  });

  test("Store name is shown on checkout page", async ({ app }) => {
    await expect(app.checkout.storeName).toContainText(ZIPS.saoPaulo.store);
  });
});
