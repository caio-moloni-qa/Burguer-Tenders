import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel, CheckoutPage } from "../pages";
import { ZIPS, PRODUCTS } from "../data/test-data";

const PRODUCT_ID = PRODUCTS.cheeseburguer;

const DELIVERY_FIELDS = [
  "checkout-zip",
  "checkout-street",
  "checkout-neighborhood",
  "checkout-city-state",
  "checkout-country",
] as const;

test.describe("Suite 06 — Checkout Form Validation", () => {
  let menu:     MenuPage;
  let checkout: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    menu = new MenuPage(page);
    const location = new LocationPanel(page);

    await menu.goto();
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(PRODUCT_ID);
    const cart = await menu.openCart();
    checkout = await cart.goToCheckout();
  });

  test("TC-06-01 — Missing name shows error", async () => {
    await checkout.emailInput.fill("a@b.com");
    await checkout.fillCard();
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("fullName")).toBeVisible();
  });

  test("TC-06-02 — Missing email shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.fillCard();
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("email")).toBeVisible();
  });

  test("TC-06-03 — Email with no @ shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("nodomain");
    await checkout.fillCard();
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("email")).toBeVisible();
  });

  test("TC-06-04 — Email with @ but no domain dot shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("alice@nodot");
    await checkout.fillCard();
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("email")).toBeVisible();
  });

  test("TC-06-05 — Card name with digits shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("alice@ex.com");
    await checkout.fillCard({ name: "Alice123", number: "4111111111111111", expiry: "1228", cvc: "123" });
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("cardNameOnCard")).toBeVisible();
  });

  test("TC-06-06 — Card number with fewer than 13 digits shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("alice@ex.com");
    await checkout.fillCard({ name: "Alice", number: "411111", expiry: "1228", cvc: "123" });
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("cardNumber")).toBeVisible();
  });

  test("TC-06-07 — Past expiry date shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("alice@ex.com");
    await checkout.fillCard({ name: "Alice", number: "4111111111111111", expiry: "0120", cvc: "123" });
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("cardExpiry")).toBeVisible();
  });

  test("TC-06-08 — Non-numeric CVC shows error", async () => {
    await checkout.nameInput.fill("Alice");
    await checkout.emailInput.fill("alice@ex.com");
    await checkout.fillCard({ name: "Alice", number: "4111111111111111", expiry: "1228", cvc: "ab" });
    await checkout.placeOrderBtn.click();
    await expect(checkout.errorFor("cardCvc")).toBeVisible();
  });

  test("TC-06-09 — Delivery inputs are present and read-only", async () => {
    for (const testId of DELIVERY_FIELDS) {
      const input = checkout.deliveryField(testId);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("readonly");
    }
  });

  test("TC-06-10 — Store name is shown on checkout page", async () => {
    await expect(checkout.storeName).toContainText(ZIPS.saoPaulo.store);
  });
});
