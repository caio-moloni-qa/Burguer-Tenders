import { test, expect } from "@playwright/test";
import {
  saveLocation, ZIPS, addToCart, goToCheckout,
  fillPersonalDetails, fillValidCard,
} from "./helpers";

const PRODUCT_ID = "cheeseburguer";

test.describe("Suite 08 — Navigation & Views", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-08-01 — Page loads at the home / menu view", async ({ page }) => {
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test("TC-08-02 — Logo click returns to home from confirmation page", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await fillPersonalDetails(page);
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');
    await expect(page.locator('[data-testid="confirmation-page"]')).toBeVisible();

    await page.click('[data-testid="site-logo"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test("TC-08-03 — Back to menu link from checkout returns to home", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await page.click('[data-testid="back-to-shop"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });

  test("TC-08-04 — Checkout spinner overlay is shown briefly", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');

    await page.click('[data-testid="go-checkout"]');
    await expect(page.locator(".page-spinner-overlay")).toBeVisible({ timeout: 1000 });
    await page.waitForSelector(".page-spinner-overlay", { state: "hidden", timeout: 3000 });
    await expect(page.locator('[data-testid="checkout-page"]')).toBeVisible();
  });

  test("TC-08-05 — Header title navigates to home", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, PRODUCT_ID);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await page.click('[data-testid="site-logo"]');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});
