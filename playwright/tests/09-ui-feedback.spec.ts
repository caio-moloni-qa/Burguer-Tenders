import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS, PRODUCTS } from "../data/test-data";

const CHEESEBURGUER = PRODUCTS.cheeseburguer;
const PACK_TENDERS  = PRODUCTS.packTenders;

test.describe("Suite 09 — UI Feedback & Panels", () => {
  let menu:     MenuPage;
  let location: LocationPanel;

  test.beforeEach(async ({ page }) => {
    menu     = new MenuPage(page);
    location = new LocationPanel(page);
    await menu.goto();
  });

  test("TC-09-01 — Add-to-cart toast contains product name [Locale-aware]", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    await expect(menu.cartToast).toBeVisible();
    await expect(menu.cartToast).toContainText("Cheeseburguer");
  });

  test("TC-09-02 — Toast auto-hides after ~2.5 seconds", async ({ page }) => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    await expect(menu.cartToast).toBeVisible();
    await page.waitForTimeout(3200);
    await expect(menu.cartToast).toBeHidden();
  });

  test("TC-09-03 — Toast timer resets when a second item is added while visible", async ({ page }) => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);

    await menu.addToCart(CHEESEBURGUER);
    await expect(menu.cartToast).toBeVisible();

    await page.waitForTimeout(1000);
    await menu.addToCart(PACK_TENDERS);

    await page.waitForTimeout(2000);
    await expect(menu.cartToast).toBeVisible();
  });

  test("TC-09-04 — Store banner appears after a valid location is saved [Locale-aware]", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(menu.storeBanner).toBeVisible();
    await expect(menu.storeBanner).toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-09-05 — Store banner is not shown before a location is saved", async () => {
    await expect(menu.storeBanner).not.toBeAttached();
  });

  test("TC-09-06 — Location panel does not re-render while typing in address fields", async () => {
    await location.open();
    await location.complementInput.click();
    await menu.page.keyboard.type("123 Main Street");
    await expect(location.complementInput).toBeFocused();
    await expect(location.complementInput).toHaveValue("123 Main Street");
  });

  test("TC-09-07 — Location pin badge indicates location is set", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(menu.locationBadge).toHaveClass(/header-location__badge--visible/);
  });

  test("TC-09-08 — Location pin badge is not shown before location is saved", async () => {
    await expect(menu.locationBadge).not.toHaveClass(/header-location__badge--visible/);
  });

  test("TC-09-09 — Cart badge is hidden when cart is empty", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await expect(menu.cartCount).not.toHaveClass(/header-cart__badge--visible/);
  });

  test("TC-09-10 — Cart badge shows total item count across different products", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    await menu.addToCart(PACK_TENDERS);
    await menu.addToCart(CHEESEBURGUER);
    await expect(menu.cartCount).toHaveText("3");
  });

  test("TC-09-11 — Checkout delivery fields are read-only", async ({ page }) => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await menu.addToCart(CHEESEBURGUER);
    const cart     = await menu.openCart();
    const checkout = await cart.goToCheckout();
    await expect(checkout.zipInput).toHaveAttribute("readonly");
    await expect(checkout.streetInput).toHaveAttribute("readonly");
  });

  test("TC-09-12 — Favicon is set to the burger SVG", async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /favicon\.svg/);
  });
});
