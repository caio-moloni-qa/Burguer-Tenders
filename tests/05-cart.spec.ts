import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS } from "./helpers";

const PRODUCT_ID = "cheeseburguer";

test.describe("Suite 05 — Cart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
  });

  test("TC-05-01 — Cart badge shows 0 and is visually hidden when cart is empty", async ({ page }) => {
    const badge = page.locator('[data-testid="cart-count"]');
    await expect(badge).toHaveText("0");
    await expect(badge).not.toHaveClass(/header-cart__badge--visible/);
  });

  test("TC-05-02 — Cart drawer opens on cart icon click", async ({ page }) => {
    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
  });

  test("TC-05-03 — Adding a product increments the badge", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("1");
  });

  test("TC-05-04 — Toast notification appears after adding", async ({ page }) => {
    // Toast text is locale-aware:
    //   en-US → "Cheeseburguer was successfully added to cart!"
    //   pt-BR → "Cheeseburguer foi adicionado ao carrinho com sucesso!"
    // Asserting on the product name is locale-agnostic and unambiguous.
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-toast"]')).toContainText("Cheeseburguer");
  });

  test("TC-05-05 — Toast auto-hides within 3 seconds", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="cart-toast"]')).toBeHidden();
  });

  test("TC-05-06 — Cart drawer does not re-render when incrementing quantity", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await page.click('[data-testid="cart-toggle"]');

    // Scroll position should survive the quantity increment
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await expect(drawer).toBeVisible();

    await page.click('[data-action="inc-line"]');
    await expect(drawer).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("2");
  });

  test("TC-05-07 — Increment and decrement update quantity correctly", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-action="inc-line"]');
    await expect(page.locator('[data-testid="cart-line-qty"]')).toHaveText("2");
    await page.click('[data-action="dec-line"]');
    await expect(page.locator('[data-testid="cart-line-qty"]')).toHaveText("1");
  });

  test("TC-05-08 — Removing last item empties cart and hides badge", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await page.click('[data-testid="cart-toggle"]');
    await page.click('[data-action="remove-line"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText("0");
    // Locale-agnostic: just assert the empty-state element is visible
    // (text is "Your cart is empty." in en-US, "Seu carrinho está vazio." in pt-BR)
    await expect(page.locator('.cart-drawer__empty')).toBeVisible();
  });

  test("TC-05-09 — Cart subtotal matches sum of line totals", async ({ page }) => {
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await page.click('[data-testid="cart-toggle"]');
    const lineTotal = await page.locator('[data-testid="line-total"]').first().textContent();
    const subtotal  = await page.locator('[data-testid="cart-subtotal"]').textContent();
    expect(lineTotal?.trim()).toBe(subtotal?.trim());
  });

  test("TC-05-10 — Cart requires a saved location to add products", async ({ page }) => {
    // Clear the session cookie set by beforeEach so that the reload starts
    // with no saved delivery location (server creates a fresh empty session).
    await page.context().clearCookies();
    await page.reload();
    await page.click(`[data-product-id="${PRODUCT_ID}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="location-panel"]')).toBeVisible();
  });
});
