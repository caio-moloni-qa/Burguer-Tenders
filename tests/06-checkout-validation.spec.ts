import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS, addToCart, goToCheckout, fillValidCard } from "./helpers";

const PRODUCT_ID = "cheeseburguer";

test.describe("Suite 06 — Checkout Form Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
  });

  // ── Personal details ─────────────────────────────────────────────────────

  test("TC-06-01 — Missing name shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-email"]', "a@b.com");
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-fullName"]')).toBeVisible();
  });

  test("TC-06-02 — Missing email shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-email"]')).toBeVisible();
  });

  test("TC-06-03 — Email with no @ shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "nodomain");
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-email"]')).toBeVisible();
  });

  test("TC-06-04 — Email with @ but no domain dot shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "alice@nodot");
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-email"]')).toBeVisible();
  });

  // ── Card name ────────────────────────────────────────────────────────────

  test("TC-06-05 — Card name with digits shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "alice@ex.com");
    await page.fill('[data-testid="checkout-card-name"]', "Alice123");
    await page.fill('[data-testid="checkout-card-number"]', "4111111111111111");
    await page.fill('[data-testid="checkout-card-expiry"]', "1228");
    await page.fill('[data-testid="checkout-card-cvc"]', "123");
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-cardNameOnCard"]')).toBeVisible();
  });

  test("TC-06-06 — Card number with fewer than 13 digits shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "alice@ex.com");
    await page.fill('[data-testid="checkout-card-name"]', "Alice");
    await page.fill('[data-testid="checkout-card-number"]', "411111");
    await page.fill('[data-testid="checkout-card-expiry"]', "1228");
    await page.fill('[data-testid="checkout-card-cvc"]', "123");
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-cardNumber"]')).toBeVisible();
  });

  test("TC-06-07 — Past expiry date shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "alice@ex.com");
    await page.fill('[data-testid="checkout-card-name"]', "Alice");
    await page.fill('[data-testid="checkout-card-number"]', "4111111111111111");
    await page.fill('[data-testid="checkout-card-expiry"]', "0120");
    await page.fill('[data-testid="checkout-card-cvc"]', "123");
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-cardExpiry"]')).toBeVisible();
  });

  test("TC-06-08 — Non-numeric CVC shows error", async ({ page }) => {
    await page.fill('[data-testid="checkout-name"]', "Alice");
    await page.fill('[data-testid="checkout-email"]', "alice@ex.com");
    await page.fill('[data-testid="checkout-card-name"]', "Alice");
    await page.fill('[data-testid="checkout-card-number"]', "4111111111111111");
    await page.fill('[data-testid="checkout-card-expiry"]', "1228");
    await page.fill('[data-testid="checkout-card-cvc"]', "ab");
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="checkout-error-cardCvc"]')).toBeVisible();
  });

  // ── Delivery fields (non-editable) ───────────────────────────────────────

  test("TC-06-09 — Delivery inputs are present and read-only", async ({ page }) => {
    const fields = [
      "checkout-zip",
      "checkout-street",
      "checkout-neighborhood",
      "checkout-city-state",
      "checkout-country",
    ];
    for (const testId of fields) {
      const input = page.locator(`[data-testid="${testId}"]`);
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("readonly");
    }
  });

  test("TC-06-10 — Store name is shown on checkout page", async ({ page }) => {
    await expect(page.locator('[data-testid="checkout-store-name"]')).toContainText(ZIPS.saoPaulo.store);
  });
});
