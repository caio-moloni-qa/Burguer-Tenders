import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS } from "../data/test-data";

test.describe("Suite 03 — Delivery Location Panel", () => {
  let menu: MenuPage;
  let location: LocationPanel;

  test.beforeEach(async ({ page }) => {
    menu     = new MenuPage(page);
    location = new LocationPanel(page);
    await menu.goto();
  });

  test("TC-03-01 — Location panel opens on clicking the pin icon", async () => {
    await location.open();
    await expect(location.panel).toBeVisible();
  });

  test("TC-03-02 — Location panel closes on X button", async () => {
    await location.open();
    await location.close();
    await expect(location.countrySelect).not.toBeInViewport();
  });

  test("TC-03-03 — Location panel closes on backdrop click", async () => {
    await location.open();
    await location.closeViaBackdrop();
    await expect(location.panel).not.toBeInViewport();
  });

  test("TC-03-04 — Location panel closes on Escape key", async () => {
    await location.open();
    await location.closeViaEscape();
    await expect(location.panel).not.toBeInViewport();
  });

  test("TC-03-05 — Only one panel open: cart closes when location opens", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);

    const cart = await menu.openCart();
    await expect(cart.drawer).toBeVisible();

    await location.open();
    await expect(cart.drawer).not.toBeInViewport();
    await expect(location.panel).toBeVisible();
  });

  test("TC-03-06 — Only one panel open: location closes when cart opens", async () => {
    await location.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);

    await location.open();
    await expect(location.panel).toBeVisible();

    const cart = await menu.openCart();
    await expect(location.panel).not.toBeInViewport();
    await expect(cart.drawer).toBeVisible();
  });

  test("TC-03-07 — Country selector changes the store list", async () => {
    await location.open();
    await expect(location.storesList).toContainText("Burguer-Tenders Higienopolis");

    await location.selectCountry("US");
    await expect(location.storesList).toContainText("Burguer-Tenders Midtown");
  });

  test("TC-03-08 — Typing in location inputs does not lose focus", async () => {
    await location.open();
    await location.zipInput.click();
    await menu.page.keyboard.type("12345");
    await expect(location.zipInput).toBeFocused();
    await expect(location.zipInput).toHaveValue("12345");
  });

  test("TC-03-09 — Cannot save location without a deliverable address", async ({ page }) => {
    await location.open();
    await location.fillZip("00000");
    page.once("dialog", (dialog) => dialog.dismiss());
    await location.saveBtn.click();
    await expect(location.panel).toBeVisible();
  });

  test("TC-03-10 — Location summary appears in header after save", async () => {
    await location.saveLocation(ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(menu.locationSummary).toBeVisible();
  });
});
