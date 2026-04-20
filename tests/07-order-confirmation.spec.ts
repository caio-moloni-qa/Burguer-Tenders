import { test, expect } from "@playwright/test";
import {
  saveLocation, ZIPS, addToCart, goToCheckout,
  fillPersonalDetails, fillValidCard,
} from "./helpers";

const PRODUCT_ID = "cheeseburguer";
const CUSTOMER   = "Alice";
const EMAIL      = "alice@example.com";

// NOTE: beforeEach saves a São Paulo (BR) location, which switches the locale to
// pt-BR before the confirmation page is rendered.  Text assertions use locale-agnostic
// sub-strings or regexes that match both en-US and pt-BR strings.

test.describe("Suite 07 — Order Placement & Confirmation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await fillPersonalDetails(page, CUSTOMER, EMAIL);
    await fillValidCard(page);
  });

  test("TC-07-01 — Submitting valid form navigates to confirmation page", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-page"]')).toBeVisible();
  });

  test("TC-07-02 — Confirmation page shows customer name in greeting [Locale-aware]", async ({ page }) => {
    // en-US: "Thank you, Alice!"   pt-BR: "Obrigado(a), Alice!"
    // Asserting on the customer name is locale-agnostic.
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirm-title"]')).toContainText(CUSTOMER);
  });

  test("TC-07-03 — Confirmation page shows order-placed subtitle [Locale-aware]", async ({ page }) => {
    // en-US: "Your order is placed!"   pt-BR: "Seu pedido foi realizado!"
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('.confirm-card__subtitle'))
      .toContainText(/order is placed|pedido foi realizado/i);
  });

  test("TC-07-04 — Confirmation page shows ETA of 30 min [Locale-aware]", async ({ page }) => {
    // The time value "30 min" is the same in both locales; only the label differs.
    // en-US: "Estimated delivery: 30 min"   pt-BR: "Entrega estimada: 30 min"
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirm-eta"]')).toContainText("30 min");
  });

  test("TC-07-05 — Confirmation page shows clock icon in ETA row", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirm-eta"] img')).toBeVisible();
  });

  test("TC-07-06 — Confirmation page shows full delivery address", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    const addr = page.locator('[data-testid="confirm-address"]');
    await expect(addr).toContainText(ZIPS.saoPaulo.zip.replace(/\D/g, ""));
    await expect(addr).not.toBeEmpty();
  });

  test("TC-07-07 — Cart is empty after order is placed [Locale-aware]", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-page"]')).toBeVisible();

    // Go back to the menu and open the cart
    await page.click('[data-testid="confirm-back"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("0");
    // Locale-agnostic: just verify the empty-state element is shown
    await expect(page.locator('.cart-drawer__empty')).toBeVisible();
  });

  test("TC-07-08 — Back to menu button returns to product grid [Locale-aware]", async ({ page }) => {
    // The button reads "Back to menu" (en-US) or "Voltar ao menu" (pt-BR).
    // We locate it by data-testid so the test is locale-agnostic.
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-page"]')).toBeVisible();

    await page.click('[data-testid="confirm-back"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});
