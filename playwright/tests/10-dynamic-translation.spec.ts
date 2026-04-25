import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS, PRODUCTS } from "../data/test-data";

const CHEESEBURGUER = PRODUCTS.cheeseburguer;

test.describe("Suite 10 — Dynamic Translation", () => {
  let menu:     MenuPage;
  let location: LocationPanel;

  test.beforeEach(async ({ page }) => {
    menu     = new MenuPage(page);
    location = new LocationPanel(page);
    await menu.goto();
  });

  test("TC-10-01 — BR lookup switches UI to Portuguese", async () => {
    await location.lookupAddress(ZIPS.londrina.zip, "BR");
    await location.closeViaEscape();
    await expect(menu.menuHeading).toHaveText("Disponível para compra");
  });

  test("TC-10-02 — US lookup keeps UI in English", async () => {
    await location.lookupAddress(ZIPS.newYork.zip, "US");
    await location.closeViaEscape();
    await expect(menu.menuHeading).toHaveText("Available to buy");
  });

  test("TC-10-03 — Prices display in BRL after BR store is resolved", async () => {
    await location.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await location.closeViaEscape();

    const prices = await menu.prices.allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(price.trim()).toMatch(/^R\$/);
    }
  });

  test("TC-10-04 — Prices remain in USD after US store is resolved", async () => {
    await location.lookupAddress(ZIPS.newYork.zip, "US");
    await location.closeViaEscape();

    const prices = await menu.prices.allTextContents();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(price.trim()).toMatch(/^\$\d/);
      expect(price.trim()).not.toMatch(/^R\$/);
    }
  });

  test("TC-10-05 — Locale does NOT change when lookup resolves to no store", async () => {
    await location.lookupAddress(ZIPS.curitiba.zip, "BR");
    await expect(location.storeStatus).toContainText("We don't deliver to this city yet");
    await location.closeViaEscape();
    await expect(menu.menuHeading).toHaveText("Available to buy");
  });

  test("TC-10-06 — Category filter labels are in Portuguese after BR lookup", async () => {
    await location.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await location.closeViaEscape();

    await expect(menu.categoryFilter.locator('option[value="all"]')).toHaveText("Tudo");
    await expect(menu.categoryFilter.locator('option[value="burger"]')).toHaveText("Hambúrgueres");
    await expect(menu.categoryFilter.locator('option[value="drink"]')).toHaveText("Bebidas");
    await expect(menu.categoryFilter.locator('option[value="side"]')).toHaveText("Acompanhamentos");
  });

  test('TC-10-07 — Spicy badge reads "Picante" in BR locale', async () => {
    await location.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await location.closeViaEscape();
    await expect(menu.spicyBadge("bt-special")).toHaveText("Picante");
  });

  test("TC-10-08 — Cart drawer title and checkout button are in Portuguese", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    const cart = await menu.openCart();
    await expect(cart.drawer).toBeVisible();
    await expect(cart.title).toHaveText("Carrinho");
    await expect(cart.goCheckoutBtn).toContainText("Ir para o pagamento");
  });

  test('TC-10-09 — Empty cart reads "Seu carrinho está vazio." in BR locale', async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    const cart = await menu.openCart();
    await expect(cart.drawer).toBeVisible();
    await expect(cart.emptyState).toHaveText("Seu carrinho está vazio.");
  });

  test("TC-10-10 — Add-to-cart toast is in Portuguese after BR store resolved", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    await expect(menu.cartToast).toContainText("foi adicionado ao carrinho com sucesso!");
  });

  test("TC-10-11 — Checkout labels are in Portuguese when BR location is active", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();

    await expect(checkout.title).toHaveText("Finalizar pedido");
    await expect(checkout.placeOrderBtn).toHaveText("Fazer pedido");
    await expect(checkout.backToShopBtn).toContainText("Voltar ao menu");
  });

  test("TC-10-12 — Confirmation page is in Portuguese when BR location is active", async ({ page }) => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();
    await checkout.fillPersonalDetails("Alice", "alice@example.com");
    await checkout.fillCard();
    const confirmation = await checkout.placeOrder();

    await expect(confirmation.title).toHaveText("Obrigado(a), Alice!");
    await expect(confirmation.subtitle).toHaveText("Seu pedido foi realizado!");
    await expect(confirmation.eta).toContainText("Entrega estimada:");
    await expect(confirmation.eta).toContainText("30 min");
    await expect(confirmation.backBtn).toHaveText("Voltar ao menu");
  });

  test("TC-10-13 — Page reload restores pt-BR locale from saved session", async ({ page }) => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(menu.storeBanner).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="menu-store-banner"]');

    await expect(menu.menuHeading).toHaveText("Disponível para compra");
    const firstPrice = await menu.prices.first().textContent();
    expect(firstPrice?.trim()).toMatch(/^R\$/);
  });

  test("TC-10-14 — Switching from BR to US location reverts to English and USD", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(menu.menuHeading).toHaveText("Disponível para compra");

    await location.lookupAddress(ZIPS.newYork.zip, "US");
    await location.closeViaEscape();

    await expect(menu.menuHeading).toHaveText("Available to buy");

    const firstPrice = await menu.prices.first().textContent();
    expect(firstPrice?.trim()).toMatch(/^\$\d/);
    expect(firstPrice?.trim()).not.toMatch(/^R\$/);
  });
});
