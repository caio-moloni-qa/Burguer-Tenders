import { test, expect } from "@playwright/test";
import {
  saveLocation, ZIPS, addToCart, goToCheckout,
  fillPersonalDetails, fillValidCard,
} from "./helpers";

const PRODUCT_ID = "cheeseburguer";
const CUSTOMER   = "Alice";
const EMAIL      = "alice@example.com";

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

  test("TC-07-02 — Confirmation page shows Thank you with customer name", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-heading"]')).toContainText(`Thank you, ${CUSTOMER}`);
  });

  test("TC-07-03 — Confirmation page shows order placed message", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-body"]')).toContainText(/order is placed/i);
  });

  test("TC-07-04 — Confirmation page shows ETA of 30 min", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-eta"]')).toContainText("30 min");
  });

  test("TC-07-05 — Confirmation page shows clock icon", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-clock-icon"]')).toBeVisible();
  });

  test("TC-07-06 — Confirmation page shows full delivery address", async ({ page }) => {
    await page.click('[data-testid="place-order"]');
    const addr = page.locator('[data-testid="confirmation-address"]');
    await expect(addr).toContainText(ZIPS.saoPaulo.zip.replace(/\D/g, ""));
    await expect(addr).not.toBeEmpty();
  });
});
