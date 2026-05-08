import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

const CHEESEBURGUER = "cheeseburguer";

function isBrlPrice(value: string): boolean {
  return value.trim().startsWith("R$");
}

function isUsdPrice(value: string): boolean {
  const text = value.trim();
  return text.startsWith("$") && text.length > 1 && text[1] >= "0" && text[1] <= "9";
}

test.describe("Dynamic Translation", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("BR lookup switches UI to Portuguese", async ({ app }) => {
    await app.lookupAddress(ZIPS.londrina.zip, "BR");
    await app.pressEscape();
    await expect(app.menu.filterButton("all")).toContainText("Tudo");
  });

  test("US lookup keeps UI in English", async ({ app }) => {
    await app.lookupAddress(ZIPS.newYork.zip, "US");
    await app.pressEscape();
    await expect(app.menu.filterButton("all")).toContainText("All");
  });

  test("Prices display in BRL after BR store is resolved", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await app.pressEscape();

    const prices = await app.menu.allProductPricesText();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(isBrlPrice(price)).toBe(true);
    }
  });

  test("Prices remain in USD after US store is resolved", async ({ app }) => {
    await app.lookupAddress(ZIPS.newYork.zip, "US");
    await app.pressEscape();

    const prices = await app.menu.allProductPricesText();
    expect(prices.length).toBeGreaterThan(0);
    for (const price of prices) {
      expect(isUsdPrice(price)).toBe(true);
      expect(isBrlPrice(price)).toBe(false);
    }
  });

  test("Locale does not change when lookup resolves to no store", async ({ app }) => {
    await app.lookupAddress(ZIPS.curitiba.zip, "BR");
    await expect(app.location.storeStatus).toContainText("We don't deliver to this city yet");
    await app.pressEscape();
    await expect(app.menu.filterButton("all")).toContainText("All");
  });

  test("Category filter labels are in Portuguese after BR lookup", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await app.pressEscape();

    await expect(app.menu.filterButton("all")).toContainText("Tudo");
    await expect(app.menu.filterButton("burger")).toContainText("Hambúrgueres");
    await expect(app.menu.filterButton("drink")).toContainText("Bebidas");
    await expect(app.menu.filterButton("side")).toContainText("Acompanhamentos");
  });

  test("Promo banner copy is in Portuguese after BR lookup", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await app.pressEscape();

    await expect(app.menu.promoBanner).toHaveAttribute("aria-label", "Promoções");
    await expect(app.menu.promoSlide("combo")).toContainText("Combo em destaque");
    await expect(app.menu.promoSlide("combo")).toContainText("Proteína nunca é demais.");
  });

  test("Product descriptions are in Portuguese after BR lookup", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await app.pressEscape();

    await expect(
      app.menu.productDescription(app.menu.productCard("cheeseburguer"))
    ).toContainText("Carne bovina");
  });

  test('Spicy badge reads "Picante" in BR locale', async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await app.pressEscape();
    await expect(app.menu.productBadge("bt-special")).toHaveText("Picante");
  });

  test("Cart drawer title and checkout button are in Portuguese", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(CHEESEBURGUER);
    await app.header.openCart();

    await expect(app.cart.drawer).toBeVisible();
    await expect(app.cart.title).toHaveText("Carrinho");
    await expect(app.cart.goCheckout).toContainText("Ir para o pagamento");
  });

  test('Empty cart reads "Seu carrinho está vazio." in BR locale', async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.header.openCart();

    await expect(app.cart.drawer).toBeVisible();
    await expect(app.cart.emptyState).toHaveText("Seu carrinho está vazio.");
  });

  test("Add-to-cart toast is in Portuguese after BR store resolved", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(CHEESEBURGUER);

    await expect(app.toast).toContainText("foi adicionado ao carrinho com sucesso!");
  });

  test("Checkout labels are in Portuguese when BR location is active", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(CHEESEBURGUER);
    await app.header.openCart();
    await app.goToCheckout();

    await expect(app.checkout.title).toHaveText("Finalizar pedido");
    await expect(app.checkout.placeOrder).toHaveText("Fazer pedido");
    await expect(app.checkout.backToShop).toContainText("Voltar ao menu");
  });

  test("Confirmation page is in Portuguese when BR location is active", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.addToCart(CHEESEBURGUER);
    await app.header.openCart();
    await app.goToCheckout();
    await app.checkout.fillPersonalDetails("Alice", "alice@example.com");
    await app.checkout.fillValidCard();
    await app.checkout.placeOrderNow();

    await expect(app.confirmation.title).toHaveText("Obrigado(a), Alice!");
    await expect(app.confirmation.subtitle).toHaveText("Seu pedido foi realizado!");
    await expect(app.confirmation.eta).toContainText("Entrega estimada:");
    await expect(app.confirmation.eta).toContainText("30 min");
    await expect(app.confirmation.backToMenu).toHaveText("Voltar ao menu");
  });

  test("Page reload restores pt-BR locale from saved session", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(app.header.storeBanner).toBeVisible();

    await app.reloadToMenu();
    await expect(app.header.storeBanner).toBeVisible();
    await expect(app.menu.filterButton("all")).toContainText("Tudo");

    const [firstPrice] = await app.menu.allProductPricesText();
    expect(isBrlPrice(firstPrice)).toBe(true);
  });

  test("Switching from BR to US location reverts to English and USD", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(app.menu.filterButton("all")).toContainText("Tudo");

    await app.lookupAddress(ZIPS.newYork.zip, "US");
    await app.pressEscape();

    await expect(app.menu.filterButton("all")).toContainText("All");

    const [firstPrice] = await app.menu.allProductPricesText();
    expect(isUsdPrice(firstPrice)).toBe(true);
    expect(isBrlPrice(firstPrice)).toBe(false);
  });
});
