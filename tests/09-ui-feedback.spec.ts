import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS, addToCart, goToCheckout, fillPersonalDetails, fillValidCard } from "./helpers";

const CHEESEBURGUER = "cheeseburguer";
const PACK_TENDERS  = "pack-tenders";

test.describe("Suite 09 — UI Feedback & Panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── TC-09-01 — Toast message (locale-aware) ──────────────────────────────

  test("TC-09-01 — Add-to-cart toast contains product name [Locale-aware]", async ({ page }) => {
    // Toast text differs by locale:
    //   en-US → "Cheeseburguer was successfully added to cart!"
    //   pt-BR → "Cheeseburguer foi adicionado ao carrinho com sucesso!"
    // Asserting on the product name is locale-agnostic.
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-toast"]')).toContainText("Cheeseburguer");
  });

  // ── TC-09-02 — Toast auto-hides ───────────────────────────────────────────

  test("TC-09-02 — Toast auto-hides after ~2.5 seconds", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();
    await page.waitForTimeout(3200); // 2500 ms display + 350 ms fade + buffer
    await expect(page.locator('[data-testid="cart-toast"]')).toBeHidden();
  });

  // ── TC-09-03 — Toast timer resets on second add ───────────────────────────

  test("TC-09-03 — Toast timer resets when a second item is added while visible", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);

    // First add
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();

    // Wait 1 second then add a second different product
    await page.waitForTimeout(1000);
    await page.click(`[data-product-id="${PACK_TENDERS}"] [data-testid="add-to-cart"]`);

    // At 3 seconds after the FIRST add the toast would have hidden without a timer
    // reset; it should still be visible because the timer restarted on the second add.
    await page.waitForTimeout(2000); // now 3 s after first add, 2 s after second
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();
  });

  // ── TC-09-04 — Store banner after save ───────────────────────────────────

  test("TC-09-04 — Store banner appears after a valid location is saved [Locale-aware]", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(page.locator('[data-testid="menu-store-banner"]')).toBeVisible();
    // Banner prefix is locale-aware ("Ordering from" / "Pedindo de"); assert only store name.
    await expect(page.locator('[data-testid="menu-store-banner"]')).toContainText(ZIPS.saoPaulo.store);
  });

  // ── TC-09-05 — No store banner before save ────────────────────────────────

  test("TC-09-05 — Store banner is not shown before a location is saved", async ({ page }) => {
    // Fresh session — no location saved yet.
    await expect(page.locator('[data-testid="menu-store-banner"]')).not.toBeAttached();
  });

  // ── TC-09-06 — No re-render while typing ─────────────────────────────────

  test("TC-09-06 — Location panel does not re-render while typing in address fields", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    const complement = page.locator('[data-testid="location-complement"]');
    await complement.click();
    await page.keyboard.type("123 Main Street");
    // If a re-render happened, the input would lose focus and/or its value.
    await expect(complement).toBeFocused();
    await expect(complement).toHaveValue("123 Main Street");
  });

  // ── TC-09-07 — Location pin badge visible after save ─────────────────────

  test("TC-09-07 — Location pin badge indicates location is set", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(page.locator('.header-location__badge')).toHaveClass(/header-location__badge--visible/);
  });

  // ── TC-09-08 — Location pin badge absent before save ─────────────────────

  test("TC-09-08 — Location pin badge is not shown before location is saved", async ({ page }) => {
    // Fresh session — badge class must NOT include the visible modifier.
    await expect(page.locator('.header-location__badge')).not.toHaveClass(/header-location__badge--visible/);
  });

  // ── TC-09-09 — Cart badge hidden when empty ───────────────────────────────

  test("TC-09-09 — Cart badge is hidden when cart is empty", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(page.locator('[data-testid="cart-count"]')).not.toHaveClass(/header-cart__badge--visible/);
  });

  // ── TC-09-10 — Cart badge correct count ──────────────────────────────────

  test("TC-09-10 — Cart badge shows total item count across different products", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`); // qty 1
    await page.click(`[data-product-id="${PACK_TENDERS}"] [data-testid="add-to-cart"]`);  // qty 1
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`); // qty 2
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("3");
  });

  // ── TC-09-11 — Checkout delivery fields read-only ─────────────────────────

  test("TC-09-11 — Checkout delivery fields are read-only", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, CHEESEBURGUER);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await expect(page.locator('[data-testid="checkout-zip"]')).toHaveAttribute("readonly");
    await expect(page.locator('[data-testid="checkout-street"]')).toHaveAttribute("readonly");
  });

  // ── TC-09-12 — Favicon ───────────────────────────────────────────────────

  test("TC-09-12 — Favicon is set to the burger SVG", async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /favicon\.svg/);
  });
});
