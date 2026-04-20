import { test, expect } from "@playwright/test";
import {
  ZIPS, saveLocation, lookupAddress,
  addToCart, goToCheckout, fillPersonalDetails, fillValidCard,
} from "./helpers";

// ─── Suite 10 — Dynamic Translation ──────────────────────────────────────────
//
// Verifies that the UI switches language and currency when a successful address
// lookup resolves to a known store, stays in the default locale when no store
// is found, and restores the correct locale on session reload.
//
// All tests begin with a fresh browser context (en-US, no location saved).

const CHEESEBURGUER = "cheeseburguer";

test.describe("Suite 10 — Dynamic Translation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── TC-10-01 — BR lookup → full UI switches to Portuguese ─────────────────

  test("TC-10-01 — BR lookup switches UI to Portuguese", async ({ page }) => {
    await lookupAddress(page, ZIPS.londrina.zip, "BR");
    // Panel is still open; locale has switched to pt-BR via emitLocationChange().
    // Close the panel to reveal the menu heading.
    await page.keyboard.press("Escape");
    await expect(page.locator("h2.menu__heading")).toHaveText("Disponível para compra");
  });

  // ── TC-10-02 — US lookup → UI stays in English ────────────────────────────

  test("TC-10-02 — US lookup keeps UI in English", async ({ page }) => {
    await lookupAddress(page, ZIPS.newYork.zip, "US");
    await page.keyboard.press("Escape");
    await expect(page.locator("h2.menu__heading")).toHaveText("Available to buy");
  });

  // ── TC-10-03 — BR prices display in BRL ───────────────────────────────────

  test("TC-10-03 — Prices display in BRL after BR store is resolved", async ({ page }) => {
    await lookupAddress(page, ZIPS.saoPaulo.zip, "BR");
    await page.keyboard.press("Escape");

    // formatPrice() converts USD→BRL and formats as "R$\u00a0X,XX"
    const prices = await page.locator(".product-card__price").allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(price.trim()).toMatch(/^R\$/);
    }
  });

  // ── TC-10-04 — US prices remain in USD ───────────────────────────────────

  test("TC-10-04 — Prices remain in USD after US store is resolved", async ({ page }) => {
    await lookupAddress(page, ZIPS.newYork.zip, "US");
    await page.keyboard.press("Escape");

    const prices = await page.locator(".product-card__price").allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(price.trim()).toMatch(/^\$\d/);     // starts with $ followed by digit
      expect(price.trim()).not.toMatch(/^R\$/);  // NOT BRL
    }
  });

  // ── TC-10-05 — No store found → locale unchanged ─────────────────────────

  test("TC-10-05 — Locale does NOT change when lookup resolves to no store", async ({ page }) => {
    // Curitiba has no store → patchLookupDOM path, no setLocale call.
    await lookupAddress(page, ZIPS.curitiba.zip, "BR");
    // Store status is still in English (no locale switch occurred).
    await expect(page.locator('[data-testid="location-store-status"]'))
      .toContainText("We don't deliver to this city yet");
    await page.keyboard.press("Escape");
    await expect(page.locator("h2.menu__heading")).toHaveText("Available to buy");
  });

  // ── TC-10-06 — Category filter labels translated ──────────────────────────

  test("TC-10-06 — Category filter labels are in Portuguese after BR lookup", async ({ page }) => {
    await lookupAddress(page, ZIPS.saoPaulo.zip, "BR");
    await page.keyboard.press("Escape");

    const filter = page.locator('[data-testid="menu-category-filter"]');
    await expect(filter.locator('option[value="all"]')).toHaveText("Tudo");
    await expect(filter.locator('option[value="burger"]')).toHaveText("Hambúrgueres");
    await expect(filter.locator('option[value="drink"]')).toHaveText("Bebidas");
    await expect(filter.locator('option[value="side"]')).toHaveText("Acompanhamentos");
  });

  // ── TC-10-07 — Spicy badge "Picante" in pt-BR ─────────────────────────────

  test('TC-10-07 — Spicy badge reads "Picante" in BR locale', async ({ page }) => {
    await lookupAddress(page, ZIPS.saoPaulo.zip, "BR");
    await page.keyboard.press("Escape");
    await expect(
      page.locator('[data-product-id="bt-special"] .product-card__badge')
    ).toHaveText("Picante");
  });

  // ── TC-10-08 — Cart drawer strings translated ─────────────────────────────

  test("TC-10-08 — Cart drawer title and checkout button are in Portuguese", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, CHEESEBURGUER);
    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator(".cart-drawer__title")).toHaveText("Carrinho");
    await expect(page.locator('[data-testid="go-checkout"]')).toContainText("Ir para o pagamento");
  });

  // ── TC-10-09 — Empty cart message translated ──────────────────────────────

  test('TC-10-09 — Empty cart reads "Seu carrinho está vazio." in BR locale', async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    await expect(page.locator(".cart-drawer__empty"))
      .toHaveText("Seu carrinho está vazio.");
  });

  // ── TC-10-10 — Toast in Portuguese ───────────────────────────────────────

  test("TC-10-10 — Add-to-cart toast is in Portuguese after BR store resolved", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click(`[data-product-id="${CHEESEBURGUER}"] [data-testid="add-to-cart"]`);
    await expect(page.locator('[data-testid="cart-toast"]'))
      .toContainText("foi adicionado ao carrinho com sucesso!");
  });

  // ── TC-10-11 — Checkout page labels in Portuguese ─────────────────────────

  test("TC-10-11 — Checkout labels are in Portuguese when BR location is active", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, CHEESEBURGUER);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);

    await expect(page.locator("h2.checkout-page__title")).toHaveText("Finalizar pedido");
    await expect(page.locator('[data-testid="place-order"]')).toHaveText("Fazer pedido");
    await expect(page.locator('[data-testid="back-to-shop"]')).toContainText("Voltar ao menu");
  });

  // ── TC-10-12 — Confirmation page in Portuguese ────────────────────────────

  test("TC-10-12 — Confirmation page is in Portuguese when BR location is active", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await addToCart(page, CHEESEBURGUER);
    await page.click('[data-testid="cart-toggle"]');
    await goToCheckout(page);
    await fillPersonalDetails(page, "Alice", "alice@example.com");
    await fillValidCard(page);
    await page.click('[data-testid="place-order"]');

    await expect(page.locator('[data-testid="confirm-title"]')).toHaveText("Obrigado(a), Alice!");
    await expect(page.locator(".confirm-card__subtitle")).toHaveText("Seu pedido foi realizado!");
    await expect(page.locator('[data-testid="confirm-eta"]')).toContainText("Entrega estimada:");
    await expect(page.locator('[data-testid="confirm-eta"]')).toContainText("30 min");
    await expect(page.locator('[data-testid="confirm-back"]')).toHaveText("Voltar ao menu");
  });

  // ── TC-10-13 — Session restore preserves locale ───────────────────────────

  test("TC-10-13 — Page reload restores pt-BR locale from saved session", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(page.locator('[data-testid="menu-store-banner"]')).toBeVisible();

    await page.reload();
    // Wait for app to hydrate (session cookie re-fetched, setLocale called before first render)
    await page.waitForSelector('[data-testid="menu-store-banner"]');

    await expect(page.locator("h2.menu__heading")).toHaveText("Disponível para compra");

    const firstPrice = await page.locator(".product-card__price").first().textContent();
    expect(firstPrice?.trim()).toMatch(/^R\$/);
  });

  // ── TC-10-14 — Switching BR → US reverts to English and USD ──────────────

  test("TC-10-14 — Switching from BR to US location reverts to English and USD", async ({ page }) => {
    // Establish pt-BR locale by saving a BR location first.
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(page.locator("h2.menu__heading")).toHaveText("Disponível para compra");

    // Look up a US ZIP — this re-opens the panel, changes country to US,
    // and after store resolution sets locale back to en-US.
    await lookupAddress(page, ZIPS.newYork.zip, "US");
    await page.keyboard.press("Escape");

    await expect(page.locator("h2.menu__heading")).toHaveText("Available to buy");

    const firstPrice = await page.locator(".product-card__price").first().textContent();
    expect(firstPrice?.trim()).toMatch(/^\$\d/);
    expect(firstPrice?.trim()).not.toMatch(/^R\$/);
  });
});
